import '../styles/globals.scss'
import type { AppProps } from 'next/app'

import { useEffect } from 'react'

import { WindowProvider } from '../hooks/useWindow'
import { ConfigProvider } from '../hooks/useConfig'
import { Web3Provider } from '../hooks/useWeb3'
import { EscrowProvider } from '../hooks/useEscrow'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log("Verity by Bentobox \nGabrielle Gamoras, Ryan Obeles, Franchesca Teng \nBS-IS BKCHAIN 1T AY21-22")
  }, [])

  return ( 
  <WindowProvider>
    <ConfigProvider>
      <Web3Provider>
        <EscrowProvider>
          <Component {...pageProps} />
        </EscrowProvider>
      </Web3Provider>
    </ ConfigProvider>
  </WindowProvider> )
}

export default MyApp
