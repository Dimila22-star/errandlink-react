import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouterProvider } from "./context/RouterContext";
import { ReviewsProvider } from "./context/ReviewsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider>
    <ReviewsProvider>
      <App />
    </ReviewsProvider>
  </RouterProvider>,
);
