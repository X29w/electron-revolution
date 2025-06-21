import { useReceiveMessageExample } from "@render/hooks/feature/use-receive-message-example";
import { type FC } from "react";
import Button from "./components/button";
import "./App.css";
import Marquee from "./components/marquee";

interface AppProps {}

const App: FC<AppProps> = () => {
  useReceiveMessageExample();
  return (
    <div className="container">
      <div>
        <h1>Welcome to Electronest</h1>
      </div>
      <Marquee />
      <div className="bottom">
        <Button onClick={async () => await fetch("http://localhost:3006/api/")}>
          fetch nest
        </Button>
        <Button onClick={() => window.electronAPI["say-hello"]()}>
          send say-hello
        </Button>
        <Button
          onClick={() => window.electronAPI["enable-main-send-message"]()}
        >
          message from main
        </Button>
        <Button onClick={() => window.electronAPI["create-window"]("child-a")}>
          create child-a window
        </Button>
        <Button
          onClick={async () => {
            const res = await window.electronAPI["invoke-example"]();
            console.log("invoke-example result: ", res);
          }}
        >
          ipc invoke example
        </Button>
      </div>
    </div>
  );
};

export default App;
