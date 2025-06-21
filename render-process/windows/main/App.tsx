import { useReceiveMessageExample } from "@render/hooks/feature/use-receive-message-example";
import { type FC } from "react";

interface AppProps {}

const App: FC<AppProps> = () => {
  useReceiveMessageExample();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button onClick={async () => await fetch("http://localhost:3006/api/")}>
        fetch nest
      </button>
      <button onClick={() => window.electronAPI["say-hello"]()}>
        send say-hello event to main-process
      </button>
      <button onClick={() => window.electronAPI["enable-main-send-message"]()}>
        enable main send message to renderer-process
      </button>
      <button onClick={() => window.electronAPI["create-window"]("child-a")}>
        create child-a window
      </button>
      <button
        onClick={async () => {
          const res = await window.electronAPI["invoke-example"]();
          console.log("invoke-example result: ", res);
        }}
      >
        ipv invoke example
      </button>
    </div>
  );
};

export default App;
