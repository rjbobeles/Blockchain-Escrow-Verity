import { useEffect, useState } from "react";

import InputField from "../components/InputField";
import Button from "../components/Button.jsx";
import Detail from "../components/Detail";
import { FaEthereum } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { buttonLabel } from "../lib/constants";

import { useEscrowProvider } from "../hooks/useEscrow";
import { useWeb3Provider } from "../hooks/useWeb3";
import { useConfigProvider } from "../hooks/useConfig";
import { useRouter } from "next/dist/client/router";

const Home = () => {
  const { config } = useConfigProvider();
  const router = useRouter();
  const { id } = router.query;

  // const [createError, setCreateError] = useState();
  // const [showCreateSpinner, setShowCreateSpinner] = useState();
  // const [showTXSpinner, setShowTXSpinner] = useState();

  // const getTX = () => {
  //   getTransaction(document.getElementById("escrow-id").value);
  // };

  // const createTX = () => {
  //   setCreateError();
  //   const amount = document.getElementById("amount").value;

  //   if (!amount) return setCreateError("Please enter an amount");
  //   else if (amount < 1000)
  //     return setCreateError("Amount must be greater than 1000 ETH");

  // if (!amount) return setCreateError("Please enter an amount");
  
  //   setShowCreateSpinner(true);
  //   setTimeout(() => {
  //     alert("Create transaction with: " + amount + " ETH");
  //     setShowCreateSpinner(false);
  //   }, 2000);
  // };

  // const buttonHandler = () => {
  //   setShowTXSpinner(true);

  //   setTimeout(() => {
  //     actionHandler(currentTransaction, viewingAs);
  //     setShowTXSpinner(false);
  //   }, 2000);
  // };

  const { 
    createEscrowTransaction, 
    fetchTransactionByAddress, 
    fetchTransactionById, 
    escrowErrors 
  } = useEscrowProvider();
  
  const { connectWeb3Wallet, isWeb3AccountsLoaded, web3UserAddress, web3Errors } = useWeb3Provider();

  const [ txid, setTxID] = useState('none')
  const [ txid2, setTxID2] = useState('none')
  const [ txaddr, setTxAddr] = useState('none')

  if (!config) return <div></div>;
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <main id="verity" className="my-24 sm:my-0">
        <header className="w-full flex flex-col md:flex-row justify-start md:justify-between mb-8 items-start md:items-end">
          <h3 className="text-ink pacifico text-5xl mb-16 text-center md:text-left w-full md:w-auto md:mb-0">
            Verity
          </h3>
          <form
            noValidate="novalidate"
            className="w-full md:w-1/3"
            onSubmit={(e) => {
              e.preventDefault();
              getTX();
            }}
          >
            <InputField
              label="Search by ID"
              type="text"
              id="escrow-id"
              name="escrow-id"
              icon={<FiSearch className="text-xl text-nikko" />}
            />
          </form>
        </header>

        {(web3Errors || escrowErrors) && (
          <div className="w-full px-6 py-4 bg-error-light text-error rounded-xl quicksand-medium mb-5">
            { web3Errors ? web3Errors : escrowErrors}
          </div>
        )}
        {/* {user ? (
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
        )}  */}
        
        <div className="flex flex-col items-center md:items-stretch md:flex-row justify-between">
          <div className="card order-2 md:order-1 flex flex-col items-stretch">  
            <p>txid: { txid }</p>
            <p>txid2: { txid2 }</p>
            <p>txaddr: { txaddr }</p>
            <p>Wallet Status: { isWeb3AccountsLoaded ? 'Loaded' : 'Not Loaded'}</p>
            <p>Ethereum Address: { isWeb3AccountsLoaded && web3UserAddress.length > 0 ? web3UserAddress[0] : '0x0'}</p>
          </div>
          
          <div className="card order-2 md:order-1 flex flex-col items-stretch">  
            <Button
                label="Connect Wallet"
                type="submit"
                color="primary"
                appearance="solid"
                barShadow={true}
                onClick={ () => connectWeb3Wallet() }
            />

            <Button
                label="Create Escrow"
                type="submit"
                color="primary"
                appearance="solid"
                barShadow={true}
                onClick={ async () => {
                  const s = await createEscrowTransaction(2, 'eth')
                  setTxID(s)
                }}
            />

            <Button
                label="Get by ID"
                type="submit"
                color="primary"
                appearance="solid"
                barShadow={true}
                onClick={ async () => {
                  console.error(txid)
                  const s = await fetchTransactionById(txid) 
                  setTxAddr(s)
                }}
            />

            <Button
                label="Get by Address"
                type="submit"
                color="primary"
                appearance="solid"
                barShadow={true}
                onClick={ async () => {
                  console.error(txaddr)
                  const s = await fetchTransactionByAddress(txaddr) 
                  setTxID2(s)
                }}
            />
          </div>
        </div>
      
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