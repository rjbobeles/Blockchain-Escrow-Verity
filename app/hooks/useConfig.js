import axios from "axios";
import { useEffect, useState } from "react";
import constate from "constate";

import { useWindowProvider } from "./useWindow";

export default function useWindow() {
  const { isWindowLoaded } = useWindowProvider();
  const [config, setConfig] = useState();

  const getConfig = async () => {
    await axios.get("/api/config").then((res) => {
      setConfig(res.data.config);
    });
  };

  useEffect(() => {
    if (!config && isWindowLoaded) {
      getConfig();
    }
  }, [config, isWindowLoaded]);

  return {
    config,
  };
}

const [ConfigProvider, useConfigProvider] = constate(useWindow);

export { ConfigProvider, useConfigProvider };
