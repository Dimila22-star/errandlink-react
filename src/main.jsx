import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouterProvider } from "./context/RouterContext";
import { ReviewsProvider } from "./context/ReviewsContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrandsProvider } from "./context/ErrandsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider>
    <AuthProvider>
      <ErrandsProvider>
        <ReviewsProvider>
          <App />
        </ReviewsProvider>
      </ErrandsProvider>
    </AuthProvider>
  </RouterProvider>,
);
