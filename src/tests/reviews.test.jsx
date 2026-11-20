// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import "../setupTests";

import App from "../App";
import { renderWithProviders, screen } from "./testUtils";

let reviews = [];

beforeEach(() => {
  reviews = [
    {
      id: "1",
      name: "Grace",
      rating: 5,
      comment: "The produce was fresh and the service was quick.",
    },
    {
      id: "2",
      name: "Brian",
      rating: 4,
      comment: "Clear communication throughout.",
    },
  ];

  vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
    const path = String(url);
    const method = options.method ?? "GET";

    if (path.includes("/reviews")) {
      if (method === "POST") {
        const review = JSON.parse(options.body);
        const newReview = { id: "new-review", ...review };
        reviews = [newReview, ...reviews];
        return {
          ok: true,
          status: 200,
          json: async () => newReview,
        };
      }

      if (method === "DELETE") {
        const id = path.split("/").pop();
        reviews = reviews.filter((review) => review.id !== id);
        return {
          ok: true,
          status: 204,
          json: async () => null,
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => reviews,
      };
    }

    if (path.includes("/requests")) {
      return {
        ok: true,
        status: 200,
        json: async () => [],
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => [],
    };
  }));

  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("customer reviews", () => {
  it("loads the list of reviews", async () => {
    renderWithProviders(<App />, { route: "/reviews" });

    expect(await screen.findByText(/The produce was fresh/)).toBeInTheDocument();
    expect(screen.getByText(/Clear communication/)).toBeInTheDocument();
  });

  it("lets a customer submit feedback", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/reviews" });

    await user.type(screen.getByLabelText("Your name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    await user.type(
      screen.getByLabelText("Tell us about your errand experience"),
      "Friendly runner and fast delivery.",
    );
    await user.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(await screen.findByText(
      "Thank you for sharing your feedback!",
    )).toBeInTheDocument();
    expect(screen.getByText(/Friendly runner and fast delivery/)).toBeInTheDocument();
  });

  it("opens a review detail page", async () => {
    renderWithProviders(<App />, { route: "/reviews/1" });

    expect(await screen.findByRole("heading", {
      name: "Review from Grace",
    })).toBeInTheDocument();
    expect(screen.getByText(/The produce was fresh/)).toBeInTheDocument();
  });

  it("can delete a review", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/reviews/1" });

    await screen.findByRole("heading", { name: "Review from Grace" });
    await user.click(screen.getByRole("button", { name: "Delete review" }));

    expect(await screen.findByRole("heading", {
      name: "What our clients say",
    })).toBeInTheDocument();
    expect(screen.queryByText(/The produce was fresh/)).not.toBeInTheDocument();
  });

  it("shows the missing-review state", async () => {
    renderWithProviders(<App />, { route: "/reviews/missing" });

    expect(await screen.findByRole("heading", {
      name: "Review not found",
    })).toBeInTheDocument();
  });
});
