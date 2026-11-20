import { render } from "@testing-library/react";

import { AuthProvider } from "../context/AuthContext";
import { ErrandsProvider } from "../context/ErrandsContext";
import { ReviewsProvider } from "../context/ReviewsContext";
import { RouterProvider } from "../context/RouterContext";

export * from "@testing-library/react";

export function renderWithProviders(ui, { route = "/" } = {}) {
  window.history.replaceState({}, "", route);

  function Providers({ children }) {
    return (
      <RouterProvider>
        <AuthProvider>
          <ErrandsProvider>
            <ReviewsProvider>{children}</ReviewsProvider>
          </ErrandsProvider>
        </AuthProvider>
      </RouterProvider>
    );
  }

  return render(ui, { wrapper: Providers });
}
