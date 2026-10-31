import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// iPhone home-screen apps can lay the page out shorter than the screen by the status bar's
// height, which leaves an empty strip under the tabs. Measure it so .h-app can cover it.
if ((navigator as Navigator & { standalone?: boolean }).standalone) {
  const measureViewportGap = () => {
    // The page's own height, the one .h-app's 100% means
    const { clientWidth, clientHeight } = document.documentElement;
    const screenHeight = clientHeight >= clientWidth
      ? Math.max(screen.width, screen.height)
      : Math.min(screen.width, screen.height);
    const gap = Math.max(0, screenHeight - clientHeight);
    document.documentElement.style.setProperty("--viewport-gap", `${gap}px`);
  };
  measureViewportGap();
  window.addEventListener("resize", measureViewportGap);
}

createRoot(document.getElementById("root")!).render(<App />);
