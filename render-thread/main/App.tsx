import type { FC } from "react";

interface AppProps {}

const App: FC<AppProps> = () => {
  return (
    <>
      <button onClick={async () => await fetch("http://localhost:3006/api/")}>
        fetch nest
      </button>
      <button onClick={() => window.electronAPI["create-window"]("child-a")}>
        create child-a window
      </button>
    </>
  );
};

export default App;
