import "./index.css";
import "@biqpod/app/ui/style.css";
import { startApplication } from "@biqpod/app/ui/app";
import { Test } from "./components/StoreRoute";
import { BrowserRouter } from "react-router-dom";
startApplication(
  <BrowserRouter>
    <Test />
  </BrowserRouter>,
  {
    isDev: import.meta.env.DEV,
    onPrepare() {},
  }
);
