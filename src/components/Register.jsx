import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useRouter } from "../context/RouterContext";

function Register({ mode = "register" }) {
  const { register, login } = useAuth();
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/errands");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="detail-page auth-page">
      <section className="auth-card">
        <h1>{isLogin ? "Welcome back" : "Create an account"}</h1>
        <p className="auth-intro">
          {isLogin
            ? "Sign in to manage your errand requests."
            : "Open an account so you can keep track of your requests."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {status && <p className="form-error" role="alert">{status}</p>}
        <p className="auth-switch">
          {isLogin ? "New to ErrandLink?" : "Already have an account?"}{" "}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="text-link"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;