import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./design/tokens.css"
import "./design/typography.css"
import "./styles/global.css"
import "./styles/components.css"
import "./styles/sections.css"
import "./styles/sections-2.css"
import "./styles/hero-dimension.css"
import "./styles/space-atmosphere.css"
import "./styles/spectral.css"
import "./styles/hero-leaks.css"
import "./styles/page-sections.css"
import "./styles/scorecard-result.css"
import "./styles/scorecard-panel.css"
import "./styles/automation-demo.css"
import "./styles/engine-explorer.css"
import "./styles/icons.css"
import "./styles/mobile-cta.css"
import "./styles/motion-stories.css"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
