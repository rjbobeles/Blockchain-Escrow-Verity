import '../styles/globals.scss'
import type { AppProps } from 'next/app'

import { useEffect } from 'react'

import { WindowProvider } from '../hooks/useWindow'
import { EscrowProvider } from '../hooks/useEscrow'
import { ConfigProvider } from '../hooks/useConfig'
import { UserIdentityProvider } from '../hooks/useUserIdentity'

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    console.log("Verity by Bentobox \nGabrielle Gamoras, Ryan Obeles, Francheska Teng \nBS-IS BKCHAIN 1T AY21-22")
  }, [])

  return ( 
  <WindowProvider>
    <ConfigProvider>
      <UserIdentityProvider>
        <EscrowProvider>
          <Component {...pageProps} />
        </EscrowProvider>
      </UserIdentityProvider>
    </ ConfigProvider>
  </WindowProvider> )
}

export default MyApp
