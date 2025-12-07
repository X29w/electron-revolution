import { ipcSend } from "@renderer-process/shared/services/ipc";
import { FC } from "react";
import reactLogo from "../../assets/react.svg";

const App: FC = () => {
  return (
    <div className="w-full h-full">
      <img
        src={reactLogo}
        className="w-96 h-96 mx-auto rotate-180 animate-spin [animation-duration:4000ms]"
        alt="React logo"
      />
      <div className="w-full text-center">main window</div>
      <div className="w-full flex justify-center">
        <button
          className="w-96 h-12 mx-auto mt-20 shadow-xl cursor-pointer"
          onClick={() => ipcSend("window:open", "child-a")}
        >
          child-a
        </button>
      </div>
    </div>
  );
};

export default App;
