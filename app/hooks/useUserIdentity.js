import { useEffect, useState } from "react";
import constate from "constate";

export default function useUserIdentity() {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser({ eth_address: "567567567" });
  }, []);

  return {
    user,
  };
}

const [UserIdentityProvider, useUserIdentityProvider] =
  constate(useUserIdentity);

export { UserIdentityProvider, useUserIdentityProvider };
