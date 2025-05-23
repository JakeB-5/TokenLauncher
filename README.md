# Token Launcher

## Overview

- A platform for simple token minting after wallet connection in a web environment
- Frontend based on React, Vite, and Yarn Berry
- Smart contract development and deployment using Hardhat and Viem

## Features

- Wallet connection and token minting UI provided
- Token creation and update via smart contract proxy pattern
- Automatic 1% fee payment on token issuance

## Project Structure

- `/contracts` : Solidity smart contracts and Hardhat environment
- `/`: React frontend and Vite environment

## Getting Started

```bash
yarn install
yarn dev        # Run frontend development server
cd contracts
yarn hh:compile # Compile smart contracts
```

## License

MIT License
