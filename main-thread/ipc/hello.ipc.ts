import { IPCHandle, IPCOn } from "../decorators/ipc-handle";

/** hello ipc */
export class HelloIPC {
  @IPCHandle("invoke-example")
  onInvoke() {
    return "response from hello ipc";
  }

  @IPCOn("say-hello")
  onEvent() {
    console.log("hello ipc received say-hello event");
  }
}
