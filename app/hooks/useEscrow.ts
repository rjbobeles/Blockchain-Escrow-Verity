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

  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const [escrowErrors, setEscrowErrors] = useState<null | string>(null);
  const [smartEscrow, setSmartEscrow] = useState<null | Contract>(null);
  const [signer, setSigner] = useState<null | Signer>(null);
  const [smartEscrowListen, setSmartEscrowListen] = useState<boolean>(false);

  const [confirmed, setConfirmed] = useState<undefined | string>();

  useEffect(() => {
    if (provider !== null && config !== null) {
      setSmartEscrow(new Contract(config.SMART_ESCROW_ADDRESS, SmartEscrow.abi));
    }
  }, [provider, config]);

  useEffect(() => {
    if (provider !== null) {
      setSigner(provider.getSigner());
    }
  }, [web3UserAddress, provider]);

  useEffect(() => {
    if (isWindowLoaded && smartEscrow !== null && signer !== null) {
      if (smartEscrowListen) {
        smartEscrow
          .connect(signer)
          .on("escrowTransactionCreated", async (transaction_id, escrowContract, seller, event) => {
            setConfirmed(transaction_id);
          });
      } else {
        smartEscrow.connect(signer).removeAllListeners();
      }
    }
  }, [smartEscrowListen, isWindowLoaded, signer, smartEscrow]);

  const preChecks = () => {
    setEscrowErrors(null);

    if (provider === null) {
      setEscrowErrors("No wallet found. Use a browser that supports ethereum wallets");
      return false;
    }

    if (!isWeb3AccountsLoaded && web3UserAddress.length < 1) {
      setEscrowErrors("No account found. Connect your ethereum wallet first.");
      return false;
    }

    return true;
  };

  const fetchTransactionByAddress = async (transaction_address: string) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      return await smartEscrow.connect(signer).transactions_id(transaction_address);
    } catch (err) {
      console.error(err);
      setEscrowErrors("Sorry, that transaction does not exist");
    }
  };

  const fetchTransactionById = async (transaction_id: string) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      return await smartEscrow.connect(signer).transactions(transaction_id);
    } catch (err) {
      console.error(err);
      setEscrowErrors("Sorry, that transaction does not exist");
    }
  };

  const createEscrowTransaction = async (amt: number) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      const txID = `0x${crypto.createHash("sha256").update(`${uuid()}`).update(`${Date.now()}`).digest("hex")}`;
      await smartEscrow.connect(signer).createEscrowTransaction(txID, web3UserAddress[0], amt);
      setSmartEscrowListen(true);
      return txID;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactionDetails = async (transaction_address: string) => {
    if (!preChecks() || provider === null || signer === null) return;

    try {
      const escrow = new Contract(transaction_address, Escrow.abi).connect(signer);
      const escrowDetails = await escrow.escrowInfo();

      setEscrowDetails(escrowDetails);
      return escrowDetails;
    } catch (err) {
      console.error(err);
      setEscrowErrors("Sorry, that transaction does not exist");
    }
  };

  const joinTransaction = async (transaction_address: string, amt: number) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      const escrow = new Contract(transaction_address, Escrow.abi).connect(signer);
      await escrow.join({ value: amt });
    } catch (err) {
      console.error(err);
    }
  };

  const releaseTransaction = async (transaction_address: string) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      const escrow = new Contract(transaction_address, Escrow.abi).connect(signer);
      await escrow.release();
    } catch (err) {
      console.error(err);
    }
  };

  const refundTransaction = async (transaction_address: string) => {
    if (!preChecks() || smartEscrow === null || provider === null || signer === null) return;

    try {
      const escrow = new Contract(transaction_address, Escrow.abi).connect(signer);
      await escrow.refund();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    createEscrowTransaction,
    fetchTransactionByAddress,
    fetchTransactionById,
    fetchTransactionDetails,
    joinTransaction,
    refundTransaction,
    releaseTransaction,
    escrowDetails,
    escrowErrors,
    setEscrowErrors,
    confirmed,
    setSmartEscrowListen,
    signer,
  };
}

const [EscrowProvider, useEscrowProvider] = constate(useEscrow);

export { EscrowProvider, useEscrowProvider };
