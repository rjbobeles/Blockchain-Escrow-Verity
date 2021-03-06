# Verity: An Ethereum Ether Escrow Platform
<br/>
<img src="https://github.com/rjbobeles/Blockchain-Escrow-Verity/blob/main/verity.png?raw=true" width="200"/>

An escrow solution between a buyer and a seller who transact with ethers. The goal is to create a middleman between the two parties to protect both of their interests. This small application will utilize Hardhat, Ethers.js, Next.js as well as Ganache to simulate locally.

## Environment Variables

### App
| Name      | Description | Value |
| ----------- | ----------- | ----------- |
| SMART_ESCROW_ADDRESS | Address of Smart Escrow Contract | Ex. `0x096c4aAA3ca705ED78C284238091D98F20e92061` |

### Contract
| Name      | Description | Value |
| ----------- | ----------- | ----------- |
| ETHERSCAN_API_KEY | etherscan API key | Ex. `ABC123ABC123ABC123ABC123ABC123ABC1` |
| ROPSTEN_URL | ropsten URL | Ex. `https://eth-ropsten.alchemyapi.io/v2/<YOUR ALCHEMY KEY>` |
| PRIVATE_KEY | ethereum private ket | Ex. `0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1`|

## Requirements
1. Node.js (>= 16.0.0)
2. Ganache or Ganache-CLI

## Setup
1. Clone repository
2. `npm install` packages for both `contract` and `app` directories.
3. Open up ganache or ganache-cli
4. Copy private key into `.env` in `contract`
5. Run `npm run deploy` to run the script
6. Copy provided address
7. Place provided address into `.env` of `app`
8. Run `npm run dev` to open next.js server

## Notes
- An ethereum wallet is required to access the application.
- Tested with **Metamask Wallet only**.
- At least 2 accounts needed to carry out a transaction (Buyer, Seller).
- While override is implemented in the contract, the app **does not have admin functionality**.

## Credits

This application is a project as a partial requirement for BKCHAIN 1T A.Y 21-22.

Developers:
- Gel Gamoras
- Ryan Obeles
- Franchesca Teng

***

Copyright &copy; Bentobox Sol 2021. All rights reserved.
