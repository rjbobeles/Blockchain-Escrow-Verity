/* eslint-disable react-hooks/exhaustive-deps */
import { Context, createContext, useEffect, useState } from "react";
import constate from "constate";
import { providers } from "ethers";

import { useConfigProvider } from "./useConfig";
import { useWindowProvider } from "./useWindow";
import { useEscrowProvider } from "./useEscrow";

declare let window: any;

const useWeb3 = () => {
  const { config } = useConfigProvider();
  const { isWindowLoaded } = useWindowProvider();
  
  const [isWeb3Browser, setIsWeb3Browser] = useState(false);
  const [isWeb3AccountsLoaded, setIsWeb3AccountsLoaded] = useState(false);
  const [web3UserAddress, setWeb3UserAddress] = useState([]);
  const [web3Errors, setWeb3Errors] = useState<null| string>(null);
  const [provider, setProvider] = useState<null | providers.Web3Provider>(null)

  if(isWindowLoaded && isWeb3Browser) {
    window.ethereum.on('accountsChanged', function (address: any) {
      if(web3UserAddress[0] !== address[0]) return setWeb3UserAddress(address)
    })
  }

  useEffect(() => {
    if(config && isWindowLoaded) {
      if(window.ethereum !== undefined) {
        setIsWeb3Browser(true);
      }
    }
  }, [config, isWindowLoaded]);

  useEffect(() => {
    if(isWeb3Browser) {
      setProvider(new providers.Web3Provider(window.ethereum));
    }
  }, [isWeb3Browser]);

  const connectWeb3Wallet = async () => {
    setWeb3Errors(null)

    if(!isWeb3Browser) {
      setWeb3Errors('No wallet found. Use a browser that supports ethereum wallets')
    }
    
    if(isWindowLoaded && isWeb3Browser) {
      await window.ethereum.enable()
        .then((address: any) => {
          setWeb3UserAddress(address);
          setIsWeb3AccountsLoaded(true);
        })
        .catch((err: any) => {
          console.error(err)
          setWeb3Errors(err.message)
        })
    }
  }

  return {
    connectWeb3Wallet,
    isWeb3Browser,
    isWeb3AccountsLoaded,
    provider,
    web3UserAddress,
    web3Errors,
  };
}

const [Web3Provider, useWeb3Provider] = constate(useWeb3);

export { Web3Provider, useWeb3Provider };
