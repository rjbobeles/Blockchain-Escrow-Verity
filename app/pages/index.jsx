import { useEffect, useState } from "react";

import InputField from "../components/InputField";
import Button from "../components/Button.jsx";
import Detail from "../components/Detail";
import { FaEthereum } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { buttonLabel, status } from "../lib/constants";

import { useEscrowProvider } from "../hooks/useEscrow";
import { useWeb3Provider } from "../hooks/useWeb3";
import { useConfigProvider } from "../hooks/useConfig";
import { useRouter } from "next/dist/client/router";

import { utils } from "ethers";

const Home = () => {
  const { config } = useConfigProvider();
  const router = useRouter();

  const [tx, setTx] = useState();
  const [isTxLoaded, setIsTxLoaded] = useState();
  const [viewingAs, setViewingAs] = useState();
  const [err, setErr] = useState();

  const {
    createEscrowTransaction,
    fetchTransactionByAddress,
    fetchTransactionById,
    fetchTransactionDetails,
    escrowErrors,
    joinTransaction,
    releaseTransaction,
    refundTransaction,
  } = useEscrowProvider();

  const {
    connectWeb3Wallet,
    isWeb3AccountsLoaded,
    web3UserAddress,
    web3Errors,
  } = useWeb3Provider();

  const [txid, setTxID] = useState();
  const [txaddr, setTxAddr] = useState();

  const [createError, setCreateError] = useState();
  const [showCreateSpinner, setShowCreateSpinner] = useState();
  const [showTXSpinner, setShowTXSpinner] = useState();

  const createTX = async () => {
    setCreateError();
    const amount = document.getElementById("amount").value;
    const unit = document.querySelector('input[name="unit"]').value;
    if (!amount) return setCreateError("Please enter an amount");
    setShowCreateSpinner(true);
    const amountInWei = utils.parseUnits(amount, unit);
    const s = await createEscrowTransaction(amountInWei);
    setIsTxLoaded(false);
    setViewingAs();
    setTxID(s);
    setIsTxLoaded(false);
  };

  const getTX = async () => {
    const q = document.getElementById("escrow-id").value;
    if (q.length === 66) {
      setTxID(q);
    } else {
      const id = await fetchTransactionByAddress(q);
      if (id === "") return setErr("Sorry, that transaction does not exist.");
      setTxID(id);
    }
    setIsTxLoaded(false);
  };

  const buttonHandler = async () => {
    console.log(tx["escrowStatus"]);
    if (viewingAs === "buyer") {
      if (tx["escrowStatus"] === 0) {
        await joinTransaction(txaddr, tx["amount"].toString());
      } else if (tx["escrowStatus"] === 1) {
        await releaseTransaction(txaddr);
      }
    } else if (viewingAs === "seller") {
      console.log("hello");
      if (tx["escrowStatus"] === 0) {
        console.log("world");
        navigator.clipboard.writeText(txid);
      } else if (tx["escrowStatus"] === 1) {
        await refundTransaction(txaddr);
      }
    }
  };

  useEffect(() => {
    if (txid && !isTxLoaded) {
      const fetchDetails = async () => {
        const address = await fetchTransactionById(txid);
        if (address === "0x0" || address === "")
          return setErr("Sorry, that transaction does not exist.");
        setTxAddr(address);
        const details = await fetchTransactionDetails(address);
        setTx(details);
        setIsTxLoaded(true);
      };

      fetchDetails();
    }
  }, [txid]);

  useEffect(() => {
    if (isTxLoaded) {
      const v =
        web3UserAddress[0].toLowerCase() === tx["seller"].toLowerCase()
          ? "seller"
          : tx["escrowStatus"] == 0 ||
            tx["buyer"].toLowerCase() === web3UserAddress[0].toLowerCase()
          ? "buyer"
          : "outsider";
      setViewingAs(v);
    }
  }, [isTxLoaded]);

  useEffect(() => {
    if (tx) console.log(tx);
  }, [tx]);

  useEffect(() => {
    if (web3Errors || escrowErrors || txid) {
      setShowCreateSpinner(false);
    }
  }, [web3Errors, escrowErrors, txid]);

  if (!config) return <div></div>;
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <main id="verity" className="my-24 md:my-0">
        <header className="w-full flex flex-col md:flex-row justify-start md:justify-between mb-8 items-start md:items-end">
          <h3 className="text-ink pacifico text-5xl mb-16 text-center md:text-left w-full md:w-auto md:mb-0">
            Verity
          </h3>
          {isWeb3AccountsLoaded && (
            <form
              noValidate="novalidate"
              className="w-full md:w-2/5"
              onSubmit={(e) => {
                e.preventDefault();
                getTX();
              }}
            >
              <InputField
                label="Search by ID or address"
                type="text"
                id="escrow-id"
                name="escrow-id"
                icon={<FiSearch className="text-xl text-nikko" />}
              />
            </form>
          )}
        </header>

        {(web3Errors || escrowErrors) && (
          <div className="w-full px-6 py-4 bg-error-light text-error rounded-xl quicksand-medium mb-5">
            {web3Errors ? web3Errors : escrowErrors}
          </div>
        )}
        {isWeb3AccountsLoaded ? (
          <div className="flex flex-col items-center md:items-stretch md:flex-row justify-between">
            <div className="card order-2 md:order-1 flex flex-row items-stretch">
              <form
                noValidate="novalidate"
                className="flex flex-col justify-between"
                onSubmit={(e) => {
                  e.preventDefault();
                  createTX();
                }}
              >
                <InputField
                  label="Enter amount"
                  type="number"
                  id="amount"
                  name="amount"
                  icon={<FaEthereum className="text-green text-2xl" />}
                  currencyDropdown={true}
                  onChange={() => {
                    if (createError) setCreateError();
                  }}
                  error={createError}
                />
                <div className="my-8 text-center quicksand-medium text-sidewalk text-sm">
                  By creating a transaction, you agree with Verity's{" "}
                  <span className="quicksand-semibold text-green">
                    Terms of Service
                  </span>
                </div>
                <Button
                  label="Create transaction"
                  type="submit"
                  color="primary"
                  appearance="solid"
                  barShadow={true}
                  onClick={() => {}}
                  showSpinner={showCreateSpinner}
                />
              </form>
            </div>
            {tx && isTxLoaded && viewingAs ? (
              <div className="card order-1 md:order-2 mb-8 md:mb-0 flex flex-col justify-between">
                <div className="mb-8">
                  <Detail
                    label="Amount"
                    value={tx["amount"].toLocaleString("en-us") + " WEI"}
                    width="w-full"
                  />
                  <div className="flex flex-col sm:flex-row">
                    <Detail
                      label="Status"
                      value={status[tx[3]]}
                      width="w-full sm:w-1/2 sm:mr-1"
                    />
                    <Detail
                      label="ID"
                      value={txid}
                      width="w-full sm:w-1/2 sm:ml-1"
                      hasCopy={true}
                    />
                  </div>
                  <Detail
                    label="ETH Address"
                    value={txaddr}
                    width="w-full"
                    hasCopy={true}
                  />
                </div>
                <div className="w-full text-center">
                  {tx["escrowStatus"] > 1 ? (
                    <span className="quicksand-medium text-sidewalk">
                      {status[tx[3]]}
                    </span>
                  ) : viewingAs === "outsider" ? (
                    ""
                  ) : (
                    <Button
                      label={buttonLabel[viewingAs][tx["escrowStatus"]]}
                      color="primary"
                      appearance={
                        buttonLabel[viewingAs][tx["escrowStatus"]] === "Cancel"
                          ? "outline"
                          : "solid"
                      }
                      barShadow={
                        buttonLabel[viewingAs][tx["escrowStatus"]] !== "Cancel"
                      }
                      onClick={() => {
                        buttonHandler();
                      }}
                      showSpinner={showTXSpinner}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="card no-transaction-selected order-1 md:order-2 mb-8 md:mb-0 flex flex-col items-center justify-center">
                <div>
                  <h5 className="quicksand-bold text-xl text-nikko text-center">
                    No transaction selected
                  </h5>
                  <p className="quicksand-medium text-sm text-sidewalk text-center">
                    Create or search for a transaction to get started
                  </p>
                </div>
              </div>
            )}
            {/* <div className="card order-2 md:order-1 flex flex-col items-stretch">
            <Button
              label="Connect Wallet"
              type="submit"
              color="primary"
              appearance="solid"
              barShadow={true}
              onClick={() => connectWeb3Wallet()}
            />

            <Button
              label="Create Escrow"
              type="submit"
              color="primary"
              appearance="solid"
              barShadow={true}
              onClick={async () => {
                const s = await createEscrowTransaction(2, "eth");
                setTxID(s);
              }}
            />

            <Button
              label="Get by ID"
              type="submit"
              color="primary"
              appearance="solid"
              barShadow={true}
              onClick={async () => {
                console.error(txid);
                const s = await fetchTransactionById(txid);
                setTxAddr(s);
              }}
            />

            <Button
              label="Get by Address"
              type="submit"
              color="primary"
              appearance="solid"
              barShadow={true}
              onClick={async () => {
                console.error(txaddr);
                const s = await fetchTransactionByAddress(txaddr);
                setTxID2(s);
              }}
            />
          </div> */}
          </div>
        ) : (
          <div className="w-full my-20 flex flex-col items-center text-center">
            <h5 className="quicksand-bold text-xl text-nikko text-center mb-2">
              No account detected
            </h5>
            <p className="quicksand-medium text-sm text-sidewalk text-center mb-6">
              Please connect your Metamask wallet to use Verity
            </p>
            <div style={{ width: "220px", maxWidth: "100%" }}>
              <Button
                label="Connect Wallet"
                type="submit"
                color="primary"
                appearance="solid"
                barShadow={true}
                onClick={() => connectWeb3Wallet()}
              />
            </div>
          </div>
        )}

        <div className="w-full text-center quicksand-medium text-faded mt-20">
          bentobox sol.
        </div>
      </main>
    </div>
  );
};

export default Home;

/* 
<div className="flex flex-col items-center md:items-stretch md:flex-row justify-between">
  <div className="card order-2 md:order-1 flex flex-row items-stretch">
    
    <form
      noValidate="novalidate"
      className="flex flex-col justify-between"
      onSubmit={(e) => {
        e.preventDefault();
        createTX();
      }}
    >
      <InputField
        label="Enter amount"
        type="number"
        id="amount"
        name="amount"
        icon={<FaEthereum className="text-green text-2xl" />}
        suffix="ETH"
        onChange={() => {
          if (createError) setCreateError();
        }}
        error={createError}
      />
      <div className="my-8 text-center quicksand-medium text-sidewalk text-sm">
        By creating a transaction, you agree with Verity's{" "}
        <span className="quicksand-semibold text-green">
          Terms of Service
        </span>
      </div>
      <Button
        label="Create transaction"
        type="submit"
        color="primary"
        appearance="solid"
        barShadow={true}
        onClick={() => {}}
        showSpinner={showCreateSpinner}
      />
    </form>
  </div>
  {currentTransaction && viewingAs ? (
    <div className="card order-1 md:order-2 mb-8 md:mb-0 flex flex-col justify-between">
      <div className="mb-8">
        <Detail
          label="Amount"
          value={
            currentTransaction.amount.toLocaleString("en-us") + " ETH"
          }
          width="w-full"
        />
        <div className="flex flex-col sm:flex-row">
          <Detail
            label="Status"
            value={currentTransaction.status}
            width="w-full sm:w-1/2 sm:mr-1"
          />
          <Detail
            label="Link"
            value={config.BASE_URL + "/?id=" + currentTransaction.id}
            width="w-full sm:w-1/2 sm:ml-1"
            hasCopy={true}
          />
        </div>
        <Detail
          label="ETH Address"
          value={currentTransaction.eth_address}
          width="w-full"
          hasCopy={true}
        />
      </div>
      <div className="w-full text-center">
        {currentTransaction.status === "released" ? (
          <span className="quicksand-medium text-sidewalk">
            Payment released
          </span>
        ) : currentTransaction.status === "refunded" ? (
          <span className="quicksand-medium text-sidewalk">
            Payment refunded
          </span>
        ) : viewingAs === "outsider" ? (
          ""
        ) : (
          <Button
            label={buttonLabel[viewingAs][currentTransaction.status]}
            color="primary"
            appearance={
              buttonLabel[viewingAs][currentTransaction.status] ===
              "Cancel"
                ? "outline"
                : "solid"
            }
            barShadow={
              buttonLabel[viewingAs][currentTransaction.status] !==
              "Cancel"
            }
            onClick={() => {
              buttonHandler();
            }}
            showSpinner={showTXSpinner}
          />
        )}
      </div>
    </div>
  ) : (
    <div className="card no-transaction-selected order-1 md:order-2 mb-8 md:mb-0 flex flex-col items-center justify-center">
      <h5 className="quicksand-bold text-xl text-nikko text-center">
        No transaction selected
      </h5>
      <p className="quicksand-medium text-sm text-sidewalk text-center">
        Create or search for a transaction to get started
      </p>
    </div>
  )}
</div> 
*/
