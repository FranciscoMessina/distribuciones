import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"

import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip"

import "katex/dist/katex.min.css"
import "./index.css"
import App from "./App.tsx"

registerSW({ immediate: true })

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <TooltipProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TooltipProvider>
  </StrictMode>
)
