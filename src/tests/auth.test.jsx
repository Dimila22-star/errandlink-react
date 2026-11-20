// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import "../setupTests";

import App from "../App";
import { renderWithProviders, screen } from "./testUtils";

let savedUser = null;

beforeEach(() => {
  savedUser = null;

  vi.stubGlobal("fetch", vi.fn(async (url, options = {}) => {
    const path = String(url);

    if (path.includes("/users") && options.method === "POST") {
      savedUser = {
        id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        password: "secret1",
      };

      return {
        ok: true,
        status: 200,
        json: async () => savedUser,
      };
    }

    if (path.includes("/users")) {
      if (path.includes("ada@example.com") && savedUser) {
        return {
          ok: true,
          status: 200,
          json: async () => [savedUser],
        };
      }

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
});

describe("authentication", () => {
  it("opens the create account page", () => {
    renderWithProviders(<App />, { route: "/register" });

    expect(screen.getByRole("heading", { name: "Create an account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("opens the sign in page", () => {
    renderWithProviders(<App />, { route: "/login" });

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });

  it("registers a new account", async () => {
    const me = userEvent.setup();
    renderWithProviders(<App />, { route: "/register" });

    await me.type(screen.getByLabelText("Name"), "Ada");
    await me.type(screen.getByLabelText("Email"), "ada@example.com");
    await me.type(screen.getByLabelText("Password"), "secret1");
    await me.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Errand requests" })).toBeInTheDocument();

    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
    });
  });

  it("rejects a wrong password", async () => {
    const me = userEvent.setup();
    savedUser = {
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      password: "secret1",
    };

    renderWithProviders(<App />, { route: "/login" });

    await me.type(screen.getByLabelText("Email"), "ada@example.com");
    await me.type(screen.getByLabelText("Password"), "wrongpass");
    await me.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password.");
  });

  it("signs in successfully", async () => {
    const me = userEvent.setup();
    savedUser = {
      id: "user-1",
      name: "Ada",
      email: "ada@example.com",
      password: "secret1",
    };

    renderWithProviders(<App />, { route: "/login" });

    await me.type(screen.getByLabelText("Email"), "ada@example.com");
    await me.type(screen.getByLabelText("Password"), "secret1");
    await me.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Errand requests" })).toBeInTheDocument();
  });

  it("switches to registration", async () => {
    const me = userEvent.setup();
    renderWithProviders(<App />, { route: "/login" });

    await me.click(screen.getByRole("link", { name: "Create an account" }));

    expect(await screen.findByRole("heading", { name: "Create an account" })).toBeInTheDocument();
  });
});
