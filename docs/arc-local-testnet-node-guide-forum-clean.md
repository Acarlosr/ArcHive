# Arc Local Testnet Node Setup Guide

This is a short setup guide for running an Arc local testnet on Windows using WSL2 and Ubuntu.

The local environment starts:

- 5 validator nodes
- 1 full node
- Blockscout
- Grafana
- Prometheus
- Local RPC endpoint

Tested with:

- Windows 11
- WSL2
- Ubuntu 24.04
- Arc node `v0.6.0`

## Hardware and software used

This was not a cloud server. I ran the Arc Local Testnet on a dedicated local Linux machine.

Hardware:

- Motherboard: Gigabyte Technology Co., Ltd. B360M AORUS Gaming 3
- Memory: 64.0 GiB RAM
- CPU: Intel Core i3-9100F x 4
- GPU: NVIDIA GeForce RTX 3060 Ti
- Storage: 2.5 TB total disk capacity

## Requirements

- Windows 10/11 with WSL2 enabled
- Ubuntu installed in WSL2
- 8 GB RAM or more
- 20 GB free disk space or more
- Stable internet connection
- Docker support inside WSL2

## 1. Install WSL2 and Ubuntu

Open PowerShell as Administrator:

```bash
wsl --install
```

Reboot when prompted. After reboot, Ubuntu will open and ask you to create a Linux username and password.

## 2. Install system dependencies

Inside Ubuntu:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential pkg-config libssl-dev protobuf-compiler clang llvm libclang-dev
```

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Install Yarn, Foundry, and Buf:

```bash
sudo npm install -g yarn
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
~/.foundry/bin/foundryup
sudo npm install -g @bufbuild/buf
```

Install Docker:

```bash
sudo apt install -y ca-certificates gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Check Docker:

```bash
docker --version
docker compose version
```

## 3. Clone and build Arc node

```bash
git clone https://github.com/circlefin/arc-node.git
cd arc-node
git checkout v0.6.0
git submodule update --init --recursive
npm install
```

Install the Foundry version required by the project:

```bash
foundryup -i v1.4.4
```

Build:

```bash
make build
```

The build can take 20-30 minutes.

If you see a `libclang` error, run:

```bash
sudo apt install -y clang llvm libclang-dev
```

Then run `make build` again.

## 4. Patch WSL2 latency setup

WSL2 does not support the `tc` traffic control module used by the local testnet latency scripts. Replace those scripts with a no-op version:

```bash
for i in validator1 validator2 validator3 validator4 validator5 full1; do
  cat > ~/arc-node/.quake/localdev/$i/latency_setup.sh << 'EOF'
#!/usr/bin/env bash
echo "Latency emulation skipped on WSL2"
exit 0
EOF
  chmod +x ~/arc-node/.quake/localdev/$i/latency_setup.sh
done
```

## 5. Fix local data permissions

Grafana, Prometheus, and Blockscout need write access to local data folders:

```bash
sudo chmod 777 ~/arc-node/.quake/monitoring/data/grafana
sudo chmod 777 ~/arc-node/.quake/monitoring/data/prometheus
sudo chmod 777 ~/arc-node/.quake/localdev/blockscout/dets
```

## 6. Start the local testnet

```bash
cd ~/arc-node
make testnet
```

When the startup finishes, these services should be available:

- Block Explorer: `http://localhost:80`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- RPC endpoint: `http://localhost:8545`

## 7. Add the network to MetaMask

Add a custom network:

```text
Network name: Arc Local Testnet
RPC URL: http://localhost:8545
Chain ID: 1337
Currency symbol: USDC
```

## 8. Fund a test wallet

Use the local genesis account only for local testing.

```bash
cast send <YOUR_METAMASK_ADDRESS> \
  --value 100ether \
  --private-key <LOCAL_GENESIS_PRIVATE_KEY> \
  --rpc-url http://localhost:8545
```

Do not use local testnet private keys on public networks or mainnet.

## 9. Useful commands

Send load to the local testnet:

```bash
make testnet-load RATE=100 TIME=30
```

Stop the local testnet:

```bash
make testnet-down
```

Clean local testnet artifacts:

```bash
make testnet-clean
```

## 10. Basic verification

The setup is working when:

- validator containers are running
- the full node is running
- block height is increasing
- Blockscout opens locally
- Grafana shows live metrics
- MetaMask can connect to `http://localhost:8545`
- a local test transaction confirms successfully

## Notes

This guide is for a local development testnet. It is different from running an Arc public testnet full node.

For a public Arc Testnet full node, follow the official Arc node documentation and use the current network requirements, snapshot process, and relay endpoints.
