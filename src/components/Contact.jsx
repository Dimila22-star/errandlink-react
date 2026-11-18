import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSending(true);
    setStatus("");

    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      setName("");
      setEmail("");
      setMessage("");
      setStatus("Thanks! Your errand request has been received.");
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="What do you need from the market?"
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
