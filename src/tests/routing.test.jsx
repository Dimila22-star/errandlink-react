// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import "../setupTests";

import App from "../App";
import { renderWithProviders, screen, waitFor } from "./testUtils";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url) => {
    const isReviews = String(url).includes("/reviews");

    const data = isReviews
      ? [{
          id: "1",
          name: "Ada",
          rating: 5,
          comment: "Fast and reliable!",
        }]
      : [];

    return {
      ok: true,
      status: 200,
      json: async () => data,
    };
  }));
});

describe("application routing", () => {
  it("renders the home page at /", () => {
    renderWithProviders(<App />, { route: "/" });

    expect(screen.getByRole("heading", {
      name: "Market shopping without the hassle",
    })).toBeInTheDocument();
  });

  it("renders the About page at /about", () => {
    renderWithProviders(<App />, { route: "/about" });

    expect(screen.getByRole("heading", { name: "About us" })).toBeInTheDocument();
  });

  it("renders the errands page at /errands", async () => {
    renderWithProviders(<App />, { route: "/errands" });

    expect(await screen.findByRole("heading", {
      name: "Errand requests",
    })).toBeInTheDocument();
  });

  it("renders registration and sign-in pages", () => {
    const firstRender = renderWithProviders(<App />, { route: "/register" });

    expect(screen.getByRole("heading", {
      name: "Create an account",
    })).toBeInTheDocument();

    firstRender.unmount();
    renderWithProviders(<App />, { route: "/login" });

    expect(screen.getByRole("heading", {
      name: "Welcome back",
    })).toBeInTheDocument();
  });

  it("renders the reviews page at /reviews", async () => {
    renderWithProviders(<App />, { route: "/reviews" });

    expect(await screen.findByRole("heading", {
      name: "What our clients say",
    })).toBeInTheDocument();
  });

  it("renders a review detail route", async () => {
    renderWithProviders(<App />, { route: "/reviews/1" });

    expect(await screen.findByRole("heading", {
      name: "Review from Ada",
    })).toBeInTheDocument();
  });

  it("renders a not-found page for unknown routes", () => {
    renderWithProviders(<App />, { route: "/missing" });

    expect(screen.getByRole("heading", {
      name: "Page not found",
    })).toBeInTheDocument();

    expect(screen.getByRole("link", {
      name: "Return to ErrandLink",
    })).toHaveAttribute("href", "/");
  });

  it("updates the page when a navigation link is clicked", async () => {
    renderWithProviders(<App />, { route: "/" });

    screen.getAllByRole("link", { name: "About" })[0].click();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/about");
    });

    expect(screen.getByRole("heading", { name: "About us" })).toBeInTheDocument();
  });
});
