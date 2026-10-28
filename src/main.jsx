import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./design/tokens.css"
import "./design/typography.css"
import "./styles/global.css"
import "./styles/components.css"
import "./styles/sections.css"
import "./styles/sections-2.css"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
