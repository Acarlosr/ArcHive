// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Moves control of the ArcHive ERC-8183 proxy from the deployer EOA to a
// TimelockController whose only proposer/executor is a Safe multisig.
//
// After this script runs:
//   - upgrades (DEFAULT_ADMIN_ROLE) and fee / hook changes (ADMIN_ROLE) can only
//     happen through the timelock, i.e. after TIMELOCK_DELAY and announced on-chain;
//   - the deployer EOA keeps NO privileged role (renounce is irreversible).
//
// NOT EXECUTED by the assistant. Run it yourself, dry-run first (no --broadcast):
//
//   export ARC_ESCROW_PROXY=0x172c7f69a802ae1e019ba4c4a7f20e874b120681
//   export SAFE_ADDRESS=0x<your Safe on Arc mainnet>
//   export TIMELOCK_DELAY=172800            # 2 days (seconds)
//   export DEPLOYER_PRIVATE_KEY=0x...       # the key of 0xDEA4...aEc5
//   forge script script/TransferAdminToTimelock.s.sol --rpc-url https://rpc.mainnet.arc.io
//   # review the simulation, then add: --broadcast
//
// Before broadcasting, make sure the Safe is deployed on Arc mainnet and that
// you can sign with enough owners: after this, nobody can undo a mistake.

import "forge-std/Script.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

interface IAgenticCommerceAccess {
    function ADMIN_ROLE() external view returns (bytes32);
    function hasRole(bytes32 role, address account) external view returns (bool);
    function grantRole(bytes32 role, address account) external;
    function renounceRole(bytes32 role, address callerConfirmation) external;
}

contract TransferAdminToTimelock is Script {
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;

    function run() external {
        address proxy = vm.envAddress("ARC_ESCROW_PROXY");
        address safe = vm.envAddress("SAFE_ADDRESS");
        uint256 delay = vm.envOr("TIMELOCK_DELAY", uint256(2 days));
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        require(safe != address(0) && safe != deployer, "SAFE_ADDRESS must be a multisig, not the deployer");
        require(safe.code.length > 0, "SAFE_ADDRESS has no code on this chain");
        require(delay >= 1 days, "TIMELOCK_DELAY too short");

        IAgenticCommerceAccess ac = IAgenticCommerceAccess(proxy);
        bytes32 adminRole = ac.ADMIN_ROLE();
        require(ac.hasRole(DEFAULT_ADMIN_ROLE, deployer), "deployer is not DEFAULT_ADMIN");
        require(ac.hasRole(adminRole, deployer), "deployer is not ADMIN");

        vm.startBroadcast(pk);

        address[] memory proposers = new address[](1);
        proposers[0] = safe;
        address[] memory executors = new address[](1);
        executors[0] = safe;
        // admin = address(0): the timelock administers itself, no backdoor.
        TimelockController timelock = new TimelockController(delay, proposers, executors, address(0));

        ac.grantRole(DEFAULT_ADMIN_ROLE, address(timelock));
        ac.grantRole(adminRole, address(timelock));

        // Never renounce before the new owner is confirmed on-chain.
        require(ac.hasRole(DEFAULT_ADMIN_ROLE, address(timelock)), "timelock missing DEFAULT_ADMIN");
        require(ac.hasRole(adminRole, address(timelock)), "timelock missing ADMIN");

        ac.renounceRole(adminRole, deployer);
        ac.renounceRole(DEFAULT_ADMIN_ROLE, deployer);

        vm.stopBroadcast();

        console.log("Timelock:", address(timelock));
        console.log("Delay (s):", delay);
        console.log("Safe (proposer/executor):", safe);
    }
}
