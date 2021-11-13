import { useEffect, useState } from 'react'
import constate from 'constate'

export default function useWindow() {
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)

  const getWindowDimensions = () => {
    if (typeof window === 'undefined') return
    const { innerWidth: width, innerHeight: height } = window

    return { width, height }
  }
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsWindowLoaded(true)
    const handleResize = () => setWindowDimensions(getWindowDimensions())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isWindowLoaded,
    windowDimensions,
  }
}

const [WindowProvider, useWindowProvider] = constate(useWindow)

export { WindowProvider, useWindowProvider }
