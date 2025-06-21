import { type FC } from "react";

interface AppProps {}

const App: FC<AppProps> = () => (
  <>
    <button onClick={async () => await fetch("http://localhost:3006/api/")}>
      fetch nest
    </button>
    <button onClick={() => window.electronAPI["say-hello"]()}>
      send say-hello event to main-thread
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
  </>
);

export default App;
