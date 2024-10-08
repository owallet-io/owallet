import { useEffect, useState } from "react";
import { InjectedProviderUrl } from "@src/screens/web/config";

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    fetch(InjectedProviderUrl)
      .then((res) => {
        return res.text();
      })
      .then((res) => {
        setCode(res);
      })
      .catch((err) => console.log(err));
  }, []);

  return code;
};
