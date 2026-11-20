import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useErrands } from "../context/ErrandsContext";
import { useRouter } from "../context/RouterContext";

function Contact() {
  const { user } = useAuth();
  const { addErrand } = useErrands();
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
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
        ...(user ? { userId: user.id } : {}),
      });

      setName("");
      setEmail("");
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
      {status && <p id="form-message">{status}</p>}
    </section>
  );
}

export default Contact; 
