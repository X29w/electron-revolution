import { ipcSend } from "@renderer-process/shared/services/ipc";
import { FC } from "react";
import reactLogo from "../../assets/react.svg";
import { useAppUpdate } from "@renderer-process/shared/hooks/use-app-updates";

const App: FC = () => {
  const { status, progress, check, download, install } = useAppUpdate();

  return (
    <div className="w-full h-full">
      <div>new new new new new new new new new new new new new new new new new new
        new new new new new new new new new new new new new new new new new new
        new new new new new new new new new new new new new new new new new new
        new new new new new new new new new new new new new new new new new new
        new new new new new new new new new new new new new new</div>
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

      <div>
        <button
          className="w-25 h-10 grid place-items-center cursor-pointer bg-green-400"
          onClick={check}
        >
          check update
        </button>

        {status === "available" && (
          <button
            className="w-25 h-10 grid place-items-center cursor-pointer bg-blue-400"
            onClick={download}
          >
            download update
          </button>
        )}

        {status === "ready" && (
          <button
            className="w-25 h-10 grid place-items-center cursor-pointer bg-red-400"
            onClick={install}
          >
            update immediately
          </button>
        )}

        {status === "downloading" && (
          <p>downloading... {progress.toFixed(1)}%</p>
        )}
      </div>
    </div>
  );
};

export default App;
