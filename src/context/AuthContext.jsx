import { createContext, useContext, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AuthContext = createContext(null);

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  async function register(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password) {
      throw new Error("Please complete every field.");
    }

    const checkRes = await fetch(`${API_URL}/users?email=${cleanEmail}`);
    if (!checkRes.ok) throw new Error("We could not create your account.");

    const existing = await checkRes.json();

    if (existing.length > 0) {
      throw new Error("That email is already registered.");
    }

    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: cleanEmail,
        password,
      }),
    });

    if (!res.ok) throw new Error("Could not create account.");

    const newUser = await res.json();
    const safeUser = publicUser(newUser);
    localStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }

  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_URL}/users?email=${cleanEmail}`);
    if (!res.ok) throw new Error("We could not sign you in.");

    const users = await res.json();
    const found = users[0];

    if (!found || found.password !== password) {
      throw new Error("Wrong email or password.");
    }

    const safeUser = publicUser(found);
    localStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}