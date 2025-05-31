import type { FC } from "react";

interface AppProps {}

const App: FC<AppProps> = () => {
  return (
    <>
      child-a
      <button onClick={async () => await fetch("http://localhost:3006/api/")}>
        fetch nest
      </button>
    </>
  );
};

export default App;
