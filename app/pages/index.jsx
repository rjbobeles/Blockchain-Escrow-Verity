import { useEffect, useState } from "react";
import { utils } from "ethers";

import InputField from "../components/InputField";
import Button from "../components/Button.jsx";
import Detail from "../components/Detail.jsx";
import { FaEthereum } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { buttonLabel, status } from "../lib/constants";

import { CircularLoading } from "respinner";

import { useEscrowProvider } from "../hooks/useEscrow";
import { useWeb3Provider } from "../hooks/useWeb3";
import { useConfigProvider } from "../hooks/useConfig";

import { Contract } from "ethers";
import Escrow from "../contracts/Escrow.sol/Escrow.json";

const Home = () => {
  const { config } = useConfigProvider();
  const {
    createEscrowTransaction,
    fetchTransactionByAddress,
    fetchTransactionById,
    fetchTransactionDetails,
    escrowErrors,
    joinTransaction,
    releaseTransaction,
    refundTransaction,
    confirmed,
    setSmartEscrowListen,
    signer,
  } = useEscrowProvider();
  const { connectWeb3Wallet, isWeb3AccountsLoaded, web3UserAddress, web3Errors } = useWeb3Provider();

  const [tx, setTx] = useState();
  const [isTxLoaded, setIsTxLoaded] = useState();
  const [viewingAs, setViewingAs] = useState();
  const [detailUnit, setDetailUnit] = useState("WEI");
  const [err, setErr] = useState();
  const [refreshing, setRefreshing] = useState();
  const [txRefreshing, setTxRefreshing] = useState();

  const [txId, setTxID] = useState();
  const [txAddr, setTxAddr] = useState();
  const [escrowListen, setEscrowListen] = useState(false);
  const [escrow, setEscrow] = useState(null);

  const [createError, setCreateError] = useState();

  const createTX = async () => {
    setCreateError();
    const amount = document.getElementById("amount").value;
    const unit = document.querySelector('input[name="unit"]').value;
    if (!amount) return setCreateError("Please enter an amount");
    const amountInWei = utils.parseUnits(amount, unit);
    const id = await createEscrowTransaction(amountInWei);
    if (id) {
      setTx({
        amount: amountInWei,
        escrowStatus: 0,
        seller: web3UserAddress[0],
        buyer: "0x0",
      });
      setTxAddr();
      setIsTxLoaded(true);
      setViewingAs("seller");
      setTxID(id);
      setRefreshing(true);
    }
  };

  const getTX = async () => {
    const q = document.getElementById("escrow-id").value;
    if (q !== txId && q !== txAddr) {
      if (q.match(/^0x[a-fA-F0-9]{64}$/)) {
        setIsTxLoaded(false);
        const addr = await fetchTransactionById(q);
        if (addr === "") return setErr("Sorry, that transaction does not exist.");
        setTxID(q);
      } else if (q.match(/^0x[a-fA-F0-9]{40}$/)) {
        setIsTxLoaded(false);
        const id = await fetchTransactionByAddress(q);
        if (id === "") return setErr("Sorry, that transaction does not exist.");
        setTxID(id);
      } else {
        setErr("Invalid ID or address");
      }
    }
  };

  const refreshTX = async () => {
    const address = await fetchTransactionById(txId);
    if (address === "0x0" || address === "") return;
    setTxAddr(address);

    const details = await fetchTransactionDetails(address);
    setTx(details);
    setIsTxLoaded(true);
  };

  const buttonHandler = async () => {
    if (viewingAs === "buyer") {
      if (tx["escrowStatus"] === 0) {
        await joinTransaction(txAddr, tx["amount"].toString());
        setTxRefreshing(true);
      } else if (tx["escrowStatus"] === 1) {
        await releaseTransaction(txAddr);
        setTxRefreshing(true);
      }
    } else if (viewingAs === "seller") {
      if (tx["escrowStatus"] === 0) {
        navigator.clipboard.writeText(txId);
      } else if (tx["escrowStatus"] === 1) {
        await refundTransaction(txAddr);
        setTxRefreshing(true);
      }
    }
  };

  useEffect(() => {
    if (txId && !isTxLoaded && escrowErrors === null) {
      const fetchDetails = async () => {
        const address = await fetchTransactionById(txId);
        if (address === "0x0" || address === "") return setErr("Sorry, that transaction does not exist.");
        setTxAddr(address);
        const details = await fetchTransactionDetails(address);
        setTx(details);
        setIsTxLoaded(true);
        setEscrowListen(true);
      };

      fetchDetails();
    }
  }, [txId]);

  useEffect(() => {
    if (isTxLoaded && escrowErrors === null) {
      const v =
        web3UserAddress[0].toLowerCase() === tx["seller"].toLowerCase()
          ? "seller"
          : tx["escrowStatus"] == 0 || tx["buyer"].toLowerCase() === web3UserAddress[0].toLowerCase()
          ? "buyer"
          : "outsider";
      setViewingAs(v);
    }
  }, [isTxLoaded]);

  useEffect(() => {
    if (isWeb3AccountsLoaded) {
      location.reload();
    }
  }, [web3UserAddress]);

  useEffect(() => {
    const fetch = async () => {
      await refreshTX();
      setRefreshing(false);
      setSmartEscrowListen(false);
    };

    if (txId && confirmed === txId) {
      fetch();
    }
  }, [confirmed]);

  useEffect(() => {
    if (txAddr) {
      setEscrow(new Contract(txAddr, Escrow.abi));
    }
  }, [txAddr, setEscrow]);

  useEffect(() => {
    const fetch = async () => {
      await refreshTX();
      setTxRefreshing(false);
    };
    if (signer !== null && escrow !== null) {
      if (escrowListen) {
        console.log(signer);
        escrow.connect(signer).on("balanceReleased", async (event) => {
          console.error("CALLED3");
          fetch();
        });

        escrow.connect(signer).on("buyerJoined", async (buyer, event) => {
          console.error("CALLED1");
          fetch();
        });

        escrow.connect(signer).on("balanceRefunded", async (event) => {
          console.error("CALLED2");
          fetch();
        });
      } else {
        escrow.connect(signer).removeAllListeners();
      }
    }
  }, [escrowListen, escrow, signer]);

  if (!config) return <div></div>;

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <main id="verity" className="my-24 md:mt-0 md:mb-36">
        <header className="w-full flex flex-col md:flex-row justify-start md:justify-between mb-8 items-start md:items-end">
          <h3 className="text-ink pacifico text-5xl mb-16 text-center md:text-left w-full md:w-auto md:mb-0">Verity</h3>
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

        {(web3Errors || escrowErrors || err) && (
          <div className="w-full px-6 py-4 bg-error-light text-error rounded-xl quicksand-medium mb-5">
            {web3Errors ? web3Errors : escrowErrors ? escrowErrors : err}
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
                  By creating a transaction, you agree with Verity{"'s "}
                  <span className="quicksand-semibold text-green">Terms of Service</span>
                </div>
                <Button
                  label="Create transaction"
                  type="submit"
                  color="primary"
                  appearance="solid"
                  barShadow={true}
                  onClick={() => {}}
                  showSpinner={false}
                />
              </form>
            </div>
            {tx && isTxLoaded && viewingAs && !escrowErrors ? (
              <div className="card order-1 md:order-2 mb-8 md:mb-0 flex flex-col justify-between">
                <div className="mb-8">
                  <div className="w-full mb-3">
                    <label className="quicksand text-sidewalk text-sm flex flex-row items-center">
                      Amount<span className="mx-2">—</span>
                      <div
                        className={`${
                          detailUnit === "WEI" && "bg-green-light text-green"
                        } quicksand-bold text-xs px-2 rounded-sm cursor-pointer`}
                        onClick={() => {
                          setDetailUnit("WEI");
                        }}
                      >
                        WEI
                      </div>
                      <div
                        className={`${
                          detailUnit === "GWEI" && "bg-green-light text-green"
                        } quicksand-bold text-xs px-2 rounded-sm cursor-pointer`}
                        onClick={() => {
                          setDetailUnit("GWEI");
                        }}
                      >
                        GWEI
                      </div>
                      <div
                        className={`${
                          detailUnit === "ETH" && "bg-green-light text-green"
                        } quicksand-bold text-xs px-2 rounded-sm cursor-pointer`}
                        onClick={() => {
                          setDetailUnit("ETH");
                        }}
                      >
                        ETH
                      </div>
                    </label>
                    <div className="flex flex-row items-center">
                      <p className="truncate quicksand-semibold text-lg text-ink">
                        {detailUnit === "WEI" && <span>{tx["amount"].toString()} WEI</span>}
                        {detailUnit === "GWEI" && (
                          <span>
                            {utils
                              .formatUnits(tx["amount"], "gwei")
                              .toString()
                              .match(/[1-9][0-9]*(\.0)/)
                              ? utils.formatUnits(tx["amount"], "gwei").toString().replace(".0", "")
                              : utils.formatUnits(tx["amount"], "gwei").toString()}{" "}
                            GWEI
                          </span>
                        )}
                        {detailUnit === "ETH" && (
                          <span>
                            {utils
                              .formatUnits(tx["amount"], "ether")
                              .toString()
                              .match(/[1-9][0-9]*(\.0)/)
                              ? utils.formatUnits(tx["amount"], "ether").toString().replace(".0", "")
                              : utils.formatUnits(tx["amount"], "ether").toString()}{" "}
                            ETH
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <Detail label="Status" value={status[tx["escrowStatus"]]} width="w-full sm:w-1/2 sm:mr-1" />
                    <Detail label="ID" value={txId} width="w-full sm:w-1/2 sm:ml-1" hasCopy={true} />
                  </div>
                  <Detail
                    label="ETH Address"
                    value={txAddr ? txAddr : "Waiting for confirmation"}
                    width="w-full"
                    hasCopy={txAddr && true}
                    spinner={refreshing}
                  />
                </div>
                <div className="w-full text-center">
                  {tx["escrowStatus"] > 1 ? (
                    <span className="quicksand-medium text-sidewalk">{status[tx["escrowStatus"]]}</span>
                  ) : viewingAs === "outsider" ? (
                    ""
                  ) : txRefreshing ? (
                    <div className="w-full flex justify-center">
                      <CircularLoading size={20} className="detail-spinner" />
                    </div>
                  ) : (
                    <Button
                      label={buttonLabel[viewingAs][tx["escrowStatus"]]}
                      color="primary"
                      appearance={buttonLabel[viewingAs][tx["escrowStatus"]] === "Cancel" ? "outline" : "solid"}
                      barShadow={buttonLabel[viewingAs][tx["escrowStatus"]] !== "Cancel"}
                      onClick={() => {
                        buttonHandler();
                      }}
                      showSpinner={false}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="card no-transaction-selected order-1 md:order-2 mb-8 md:mb-0 flex flex-col items-center justify-center">
                <div>
                  <h5 className="quicksand-bold text-xl text-nikko text-center">No transaction selected</h5>
                  <p className="quicksand-medium text-sm text-sidewalk text-center">
                    Create or search for a transaction to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full my-20 flex flex-col items-center text-center">
            <h5 className="quicksand-bold text-xl text-nikko text-center mb-2">No account detected</h5>
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

        <div className="w-full text-center quicksand-medium text-faded mt-20">bentobox sol.</div>
      </main>
    </div>
  );
};

export default Home;

// import { useEffect, useState } from "react";
// import { utils, Contract } from "ethers";

// import InputField from "../components/InputField";
// import Button from "../components/Button.jsx";
// import Detail from "../components/Detail.jsx";
// import { FaEthereum } from "react-icons/fa";
// import { FiSearch } from "react-icons/fi";

// import { buttonLabel, status } from "../lib/constants";

// import { useEscrowProvider } from "../hooks/useEscrow";
// import { useWeb3Provider } from "../hooks/useWeb3";
// import { useConfigProvider } from "../hooks/useConfig";

// const Home = () => {
//   const { config } = useConfigProvider();
//   const { connectWeb3Wallet, isWeb3AccountsLoaded, web3UserAddress, web3Errors, signer } = useWeb3Provider();

//   const [tx, setTx] = useState();
//   const [isTxLoaded, setIsTxLoaded] = useState();
//   const [viewingAs, setViewingAs] = useState();
//   const [detailUnit, setDetailUnit] = useState("WEI");
//   const [err, setErr] = useState();
//   const [refreshing, setRefreshing] = useState();
//   const [statusNeedsRefresh, setStatusNeedsRefresh] = useState();
//   const [txId, setTxID] = useState();
//   const [txAddr, setTxAddr] = useState();
//   const [createError, setCreateError] = useState();

//   const {
//     createEscrowTransaction,
//     fetchTransactionByAddress,
//     fetchTransactionById,
//     fetchTransactionDetails,
//     escrowErrors,
//     joinTransaction,
//     releaseTransaction,
//     refundTransaction,
//     confirmed,
//     setSmartEscrowListen,
//   } = useEscrowProvider();

//   const createTX = async () => {
//     setCreateError();
//     const amount = document.getElementById("amount").value;
//     const unit = document.querySelector('input[name="unit"]').value;
//     if (!amount) return setCreateError("Please enter an amount");
//     const amountInWei = utils.parseUnits(amount, unit);
//     const id = await createEscrowTransaction(amountInWei);
//     if (id) {
//       setTx({
//         amount: amountInWei,
//         escrowStatus: 0,
//         seller: web3UserAddress[0],
//         buyer: "0x0",
//       });
//       setTxAddr();
//       setIsTxLoaded(true);
//       setTxID(id);
//       setRefreshing(true);
//     }
//   };

//   const getTX = async () => {
//     const q = document.getElementById("escrow-id").value;
//     if (q !== txId && q !== txAddr) {
//       if (q.match(/^0x[a-fA-F0-9]{64}$/)) {
//         setIsTxLoaded(false);
//         const addr = await fetchTransactionById(q);
//         if (addr === "") return setErr("Sorry, that transaction does not exist.");
//         setTxID(q);
//       } else if (q.match(/^0x[a-fA-F0-9]{40}$/)) {
//         setIsTxLoaded(false);
//         const id = await fetchTransactionByAddress(q);
//         if (id === "") return setErr("Sorry, that transaction does not exist.");
//         setTxID(id);
//       } else {
//         setErr("Invalid ID or address");
//       }
//     }
//   };

//   const refreshTX = async () => {
//     const address = await fetchTransactionById(txId);
//     if (address === "0x0" || address === "") return;
//     setTxAddr(address);

//     const details = await fetchTransactionDetails(address);
//     setTx(details);

//     setIsTxLoaded(true);
//     if (statusNeedsRefresh) setStatusNeedsRefresh(false);
//   };

//   const buttonHandler = async () => {
//     if (viewingAs === "buyer") {
//       if (tx["escrowStatus"] === 0) {
//         await joinTransaction(txAddr, tx["amount"].toString());
//         setStatusNeedsRefresh(true);
//       } else if (tx["escrowStatus"] === 1) {
//         await releaseTransaction(txAddr);
//         setStatusNeedsRefresh(true);
//       }
//     } else if (viewingAs === "seller") {
//       if (tx["escrowStatus"] === 0) {
//         navigator.clipboard.writeText(txId);
//       } else if (tx["escrowStatus"] === 1) {
//         await refundTransaction(txAddr);
//         setStatusNeedsRefresh(true);
//       }
//     }
//   };

//   useEffect(() => {
//     if (txId && !isTxLoaded && escrowErrors === null) {
//       const fetchDetails = async () => {
//         const address = await fetchTransactionById(txId);
//         if (address === "0x0" || address === "") return setErr("Sorry, that transaction does not exist.");
//         setTxAddr(address);
//         const details = await fetchTransactionDetails(address);
//         setTx(details);
//         setIsTxLoaded(true);
//       };

//       fetchDetails();
//     }
//   }, [txId, isTxLoaded, escrowErrors, fetchTransactionById, fetchTransactionDetails]);

//   useEffect(() => {
//     if (isTxLoaded && escrowErrors === null) {
//       const v =
//         web3UserAddress[0].toLowerCase() === tx["seller"].toLowerCase()
//           ? "seller"
//           : tx["escrowStatus"] == 0 || tx["buyer"].toLowerCase() === web3UserAddress[0].toLowerCase()
//           ? "buyer"
//           : "outsider";
//       setViewingAs(v);
//     }
//   }, [isTxLoaded, escrowErrors, tx, web3UserAddress]);

//   useEffect(() => {
//     if (isWeb3AccountsLoaded) {
//       location.reload();
//     }
//   }, [web3UserAddress, isWeb3AccountsLoaded]);

//   useEffect(() => {
//     const fetch = async () => {
//       await refreshTX();
//       setRefreshing(false);
//       setSmartEscrowListen(false);
//     };

//     if (txId && confirmed === txId) {
//       fetch();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [confirmed, setSmartEscrowListen, txId]);
