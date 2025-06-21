import { useEffect, useState } from "react";

/** the hook to receive message from main-process */
export const useReceiveMessageExample = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    window.electronAPI["messages-from-main-process"]((msg) => {
      console.log("Message from main-process: ", msg);
      setMessage(msg);
    });
  }, []);
  return message;
};
