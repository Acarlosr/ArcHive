// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

// Deploy script for ArcHive's ERC-8183 AgenticCommerce on Arc.
// Deploys the reference implementation (UUPS) behind an ERC-1967 proxy and
// initializes it with the native USDC address and the platform treasury.
//
// Run with Arc Foundry:
//   cd contracts/erc8183
//   forge install OpenZeppelin/openzeppelin-contracts OpenZeppelin/openzeppelin-contracts-upgradeable foundry-rs/forge-std
//   arc-forge build
//   arc-forge script DeployAgenticCommerce \
//     --rpc-url $ARC_RPC_URL \
//     --private-key $DEPLOYER_PRIVATE_KEY \
//     --broadcast
//
// Gas on Arc is paid in USDC: make sure the deployer wallet holds USDC.
// The mempool enforces a 20 Gwei maxFeePerGas floor (evm-differences).

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {AgenticCommerce} from "../src/AgenticCommerce.sol";

contract DeployAgenticCommerce is Script {
    // Arc native USDC — same address on mainnet and testnet.
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (address proxy, address implementation) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address treasury = vm.envOr(
            "PLATFORM_TREASURY",
            vm.addr(deployerKey)
        );

        vm.startBroadcast(deployerKey);

        implementation = address(new AgenticCommerce());
        bytes memory initData = abi.encodeCall(
            AgenticCommerce.initialize,
            (USDC, treasury)
        );
        proxy = address(new ERC1967Proxy(implementation, initData));

        vm.stopBroadcast();

        console.log("AgenticCommerce implementation:", implementation);
        console.log("AgenticCommerce proxy:", proxy);
        console.log("Payment token (USDC):", USDC);
        console.log("Platform treasury:", treasury);
        console.log("Deployer/admin:", vm.addr(deployerKey));
        console.log("Set NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS to the proxy address above.");
    }
}
