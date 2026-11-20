import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useErrands } from "../context/ErrandsContext";
import { Link, useRouter } from "../context/RouterContext";

function Contact() {
  const { user } = useAuth();
  const { addErrand } = useErrands();
  const { navigate } = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    setIsSending(true);
    setStatus("");

    try {
      await addErrand({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
        userId: user.id,
      });

      setMessage("");
      setImageUrl("");
      navigate("/errands");
    } catch {
      setStatus("Could not send request. Make sure the server is running.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section id="contact">
      <h2>Request an errand</h2>

      {!user ? (
        <p className="auth-switch">
          Please{" "}
          <Link to="/login" className="text-link">sign in</Link> or{" "}
          <Link to="/register" className="text-link">create an account</Link>{" "}
          to request an errand.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              aria-label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your email"
              aria-label="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              aria-label="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <textarea
              placeholder="What do you need from the market?"
              aria-label="What do you need from the market?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={isSending}>
              {isSending ? "Sending..." : "Send request"}
            </button>
          </form>
          {status && <p className="form-message">{status}</p>}
        </>
      )}
    </section>
  );
}

export default Contact;