import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import ErrorBoundary from "./app/ErrorBoundary.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = `
    <div style="
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f8f8;
      font-family: Arial, sans-serif;
    ">
      <div style="text-align: center;">
        <h1 style="color: #d32f2f; margin-bottom: 10px;">Render Error</h1>
        <p style="color: #666;">Root element not found. Check index.html for &lt;div id="root"&gt;</p>
      </div>
    </div>
  `;
} else {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

  