// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import "../setupTests";

import App from "../App";
import { renderWithProviders, screen } from "./testUtils";

let requests = [];

beforeEach(() => {
  localStorage.clear();
  requests = [
    {
      id: "1",
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Fresh tomatoes",
      status: "pending",
      userId: "user-1",
    },
    {
      id: "2",
      name: "Peter Smith",
      email: "peter@example.com",
      message: "A bag of potatoes",
      status: "completed",
    },
  ];

  vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
    const path = String(url);
    const method = options.method || "GET";

    if (path.includes("/requests")) {
      if (method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => requests,
        };
      }

      if (method === "POST") {
        const errand = JSON.parse(options.body);
        const newRequest = { id: "new-request", ...errand };
        requests = [newRequest, ...requests];
        return {
          ok: true,
          status: 200,
          json: async () => newRequest,
        };
      }

      if (method === "PATCH") {
        const changes = JSON.parse(options.body);
        const id = path.split("/").pop();
        const current = requests.find((item) => item.id === id);
        const updated = { ...current, ...changes };
        requests = requests.map((item) => item.id === id ? updated : item);
        return {
          ok: true,
          status: 200,
          json: async () => updated,
        };
      }

      if (method === "DELETE") {
        const id = path.split("/").pop();
        requests = requests.filter((item) => item.id !== id);
        return {
          ok: true,
          status: 204,
          json: async () => null,
        };
      }
    }

    if (path.includes("/reviews")) {
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

describe("errand requests", () => {
  it("shows sign-in options to guests", async () => {
    renderWithProviders(<App />, { route: "/errands" });

    expect(await screen.findByRole("heading", { name: "Errand requests" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Sign in" })[0])
      .toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "create an account" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("filters and searches the request list", async () => {
    const me = userEvent.setup();
    renderWithProviders(<App />, { route: "/errands" });

    expect(await screen.findByText("Fresh tomatoes")).toBeInTheDocument();
    expect(screen.getByText("A bag of potatoes")).toBeInTheDocument();

    await me.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.queryByText("Fresh tomatoes")).not.toBeInTheDocument();
    expect(screen.getByText("A bag of potatoes")).toBeInTheDocument();

    await me.click(screen.getByRole("button", { name: "All" }));
    await me.type(screen.getByRole("searchbox", { name: "Search errands" }), "tomatoes");

    expect(screen.getByText("Fresh tomatoes")).toBeInTheDocument();
    expect(screen.queryByText("A bag of potatoes")).not.toBeInTheDocument();
  });

  it("adds a request while signed in", async () => {
    localStorage.setItem("user", JSON.stringify({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
    }));

    const me = userEvent.setup();
    renderWithProviders(<App />, { route: "/errands" });

    await screen.findByText("Fresh tomatoes");
    await me.clear(screen.getByLabelText("Name"));
    await me.clear(screen.getByLabelText("Email"));
    await me.type(screen.getByLabelText("Name"), "Ada");
    await me.type(screen.getByLabelText("Email"), "ada@example.com");
    await me.type(screen.getByLabelText("What do you need?"), "Two bunches of bananas");
    await me.click(screen.getByRole("button", { name: "Add errand" }));

    expect(await screen.findByText("Two bunches of bananas")).toBeInTheDocument();
    expect(screen.getByText("Your errand request has been added.")).toBeInTheDocument();
  });

  it("updates and removes an owned request", async () => {
    localStorage.setItem("user", JSON.stringify({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
    }));

    const me = userEvent.setup();
    renderWithProviders(<App />, { route: "/errands" });

    await screen.findByText("Fresh tomatoes");
    await me.click(screen.getAllByRole("button", { name: "Mark completed" })[0]);

    expect((await screen.findAllByText("Completed")).length).toBeGreaterThan(0);

    await me.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(screen.queryByText("Fresh tomatoes")).not.toBeInTheDocument();
  });
});
