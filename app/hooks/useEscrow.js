import { useEffect, useState } from "react";
import constate from "constate";

import { useConfigProvider } from "./useConfig";
import { useUserIdentityProvider } from "./useUserIdentity";

export default function useEscrow() {
  const { config } = useConfigProvider();
  const { user } = useUserIdentityProvider();
  const [currentTransaction, setCurrentTransaction] = useState();
  const [viewingAs, setViewingAs] = useState();
  const [error, setError] = useState();

  const temp = [
    {
      amount: 50000,
      status: "pending",
      id: "1",
      eth_address: "0xcd231dcls922xks0933mc902mx",
      seller: "123123123",
    },
    {
      amount: 36000,
      status: "paid",
      id: "2",
      eth_address: "0xcd231dcls922xks0933mc902mx",
      seller: "123123123",
      buyer: "567567567",
    },
    {
      amount: 950000,
      status: "released",
      id: "3",
      eth_address: "0xcd231dcls922xks0933mc902mx",
      seller: "123123123",
      buyer: "567567567",
    },
    {
      amount: 8600,
      status: "refunded",
      id: "4",
      eth_address: "0xcd231dcls922xks0933mc902mx",
      seller: "123123123",
      buyer: "567567567",
    },
  ];

  const getTransaction = (id) => {
    setError();
    const tx = temp.filter((t) => t.id === id);

    if (tx.length < 1) {
      setError("Sorry, that transaction does not exist.");
      setCurrentTransaction();
    } else {
      setCurrentTransaction(tx[0]);
    }
  };

  const actionHandler = (tx, va) => {
    if (va === "seller") {
      if (tx.status === "pending")
        return alert("This will cancel the transaction");
      if (tx.status === "paid")
        return alert("This will refund the transaction");
    } else if (va === "buyer") {
      if (tx.status === "pending") return alert("Pay for the transaction");
      if (tx.status === "paid")
        return alert("This wil release the transaction");
    }
  };

  useEffect(() => {
    if (currentTransaction) {
      if (user.eth_address === currentTransaction.seller) {
        setViewingAs("seller");
      } else if (
        currentTransaction.status === "pending" ||
        currentTransaction.buyer === user.eth_address
      ) {
        setViewingAs("buyer");
      } else {
        setViewingAs("outsider");
      }
    }
  }, [currentTransaction]);

  return {
    currentTransaction,
    viewingAs,
    getTransaction,
    error,
    actionHandler,
  };
}

const [EscrowProvider, useEscrowProvider] = constate(useEscrow);

export { EscrowProvider, useEscrowProvider };
