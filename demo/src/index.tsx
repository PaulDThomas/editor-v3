import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { ContextWindowStack } from "@asup/context-menu";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ContextWindowStack>
      <App />
    </ContextWindowStack>
  </React.StrictMode>,
);
