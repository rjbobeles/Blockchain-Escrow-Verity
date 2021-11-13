import { useEffect, useState } from "react";
import constate from "constate";
import crypto from "crypto";
import { v4 as uuid } from "uuid";

import { useWindowProvider } from "./useWindow";
import { useWeb3Provider } from "./useWeb3";
import { useConfigProvider } from "./useConfig";
import { Contract, Signer, utils } from "ethers";

import SmartEscrow from "../contracts/SmartEscrow.sol/SmartEscrow.json";
import Escrow from "../contracts/Escrow.sol/Escrow.json";

export default function useEscrow() {
  const { config } = useConfigProvider();
  const { isWindowLoaded } = useWindowProvider();
  const { isWeb3AccountsLoaded, provider, web3UserAddress } = useWeb3Provider();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewingAs, setViewingAs] = useState<'Admin' | 'Outsider' | 'Buyer' | 'Seller'>('Outsider'); 
  
  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const [escrowErrors, setEscrowErrors] = useState<null | string>(null);
  const [smartEscrow, setSmartEscrow] = useState<null | Contract>(null);
  const [signer, setSigner] = useState<null | Signer>(null);

  useEffect(() => {
    if(provider !== null && config !== null) {
      setSmartEscrow(new Contract(config.SMART_ESCROW_ADDRESS, SmartEscrow.abi))
    }
  }, [provider, config])

  useEffect(() => {
    if(provider !== null) {
      setSigner(provider.getSigner())
    }
  }, [web3UserAddress, provider])

  if(isWindowLoaded && smartEscrow !== null && signer !== null) {
    smartEscrow.connect(signer).on('escrowTransactionCreated', async (transaction_id, escrowContract, seller, event) => {
      console.error(event)
    })

    smartEscrow.connect(signer).on('escrowTransactionOveridden', async (transaction_id, escrowContract, event) => {
      console.error(event)
    })
  }
    
  const preChecks = () => {
    setEscrowErrors(null);

    if(provider === null) {
      setEscrowErrors('No wallet found. Use a browser that supports ethereum wallets')
      return false
    }  
    
    if(!isWeb3AccountsLoaded && web3UserAddress.length < 1)  {
      setEscrowErrors('No account found. Connect your ethereum wallet first.')    
      return false
    }
      
    return true
  }

  const fetchTransactionByAddress = async (transaction_address: string) => {
    if(!preChecks() || smartEscrow === null || provider === null || signer === null) return

    const txID = await smartEscrow.connect(signer).transactions_id(transaction_address);
    return txID
  } 

  const fetchTransactionById = async (transaction_id: string) => {
    if(!preChecks() || smartEscrow === null || provider === null || signer === null) return

    const address = await smartEscrow.connect(signer).transactions(transaction_id)
    return address
  }

  const createEscrowTransaction = async (amt: number) => {
    if(!preChecks() || smartEscrow === null || provider === null || signer === null) return

    const txID = `0x${crypto.createHash("sha256").update(`${uuid()}`).update(`${Date.now()}`).digest("hex")}`;
    await smartEscrow.connect(signer).createEscrowTransaction(txID, web3UserAddress[0], utils.formatUnits(amt, 'wei'));
    return txID
  }

  const overrideEscrowTransaction = async () => {
    if(!preChecks() || !isSuperAdmin) return
  }

  const joinTransaction = async () => {
    if(!preChecks()) return   
  }

  const releaseTransaction = async () => {
    if(!preChecks()) return
  }

  const refundTransaction = async () => {
    if(!preChecks()) return
  }

  return {
    createEscrowTransaction,
    fetchTransactionByAddress,
    fetchTransactionById,
    joinTransaction,
    overrideEscrowTransaction,
    refundTransaction,
    releaseTransaction,
    escrowDetails,
    escrowErrors,
    isSuperAdmin,
    viewingAs,
    setEscrowErrors,
  }
}

const [EscrowProvider, useEscrowProvider] = constate(useEscrow);

export { EscrowProvider, useEscrowProvider };
