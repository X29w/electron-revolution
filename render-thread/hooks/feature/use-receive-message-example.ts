import { useEffect, useState } from "react";

/** the hook to receive message from main-thread */
export const useReceiveMessageExample = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    window.electronAPI["messages-from-main-thread"]((msg) => {
      console.log("Message from main-thread: ", msg);
      setMessage(msg);
    });
  }, []);
  return message;
};
