import { createRoot } from "react-dom/client";
import { ExtensionTabs } from "./components/tabs";
import { LoginCheck } from "./components/login-check";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <LoginCheck>
    <ExtensionTabs />
  </LoginCheck>
); 