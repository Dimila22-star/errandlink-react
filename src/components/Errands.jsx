import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useErrands } from "../context/ErrandsContext";
import { Link } from "../context/RouterContext";

function getImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function Errands() {
  const { user } = useAuth();
  const { errands, isLoading, loadError, addErrand, updateErrand, deleteErrand } =
    useErrands();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setIsAdding(true);

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
      setMessage("");
      setImageUrl("");
      setStatus("Your errand request has been added.");
    } catch {
      setStatus("We could not add that request. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  async function changeStatus(errand) {
    setBusyId(errand.id);
    try {
      await updateErrand(errand.id, {
        status: errand.status === "completed" ? "pending" : "completed",
      });
    } catch {
      setStatus("We could not update that request.");
    } finally {
      setBusyId("");
    }
  }

  async function removeErrand(id) {
    if (!window.confirm("Remove this errand request?")) return;

    setBusyId(id);
    try {
      await deleteErrand(id);
    } catch {
      setStatus("We could not remove that request.");
    } finally {
      setBusyId("");
    }
  }

  function canManage(errand) {
    return Boolean(
      user &&
        (`${errand.userId}` === `${user.id}` ||
          errand.email?.toLowerCase() === user.email.toLowerCase()),
    );
  }

  return (
    <main className="detail-page errands-page">
      <section>
        <h1>Errand requests</h1>
        <p className="auth-intro">Browse requests shared by the ErrandLink community.</p>

        <form className="errand-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Image URL <span className="optional-label">(optional)</span>
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/item-photo.jpg"
            />
          </label>
          <label>
            What do you need?
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="List the items or task you need help with..."
              required
            />
          </label>
          <button type="submit" className="btn" disabled={isAdding}>
            {isAdding ? "Adding..." : "Add errand"}
          </button>
        </form>

        {status && <p id="form-message" role="status">{status}</p>}
        {!user && (
          <p className="auth-switch">
            Want to keep track of your requests?{" "}
            <Link to="/login" className="text-link">Sign in</Link> or{" "}
            <Link to="/register" className="text-link">create an account</Link>.
          </p>
        )}
        {isLoading && <p className="api-message">Loading errand requests...</p>}
        {loadError && <p className="form-error" role="alert">{loadError}</p>}

        <div className="errands-list">
          {!isLoading && errands.length === 0 && (
            <p className="empty-state">There are no errand requests yet.</p>
          )}
          {errands.map((errand) => (
            <article className="errand-card" key={errand.id}>
              <div>
                <span className={`status status-${errand.status}`}>
                  {errand.status === "completed" ? "Completed" : "Pending"}
                </span>
                <h2 className="errand-owner">{errand.name}</h2>
                <p>{errand.message}</p>
                {getImageUrl(errand.imageUrl || "") && (
                  <img
                    className="errand-image"
                    src={getImageUrl(errand.imageUrl)}
                    alt={`Image for ${errand.message}`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
              </div>
              {canManage(errand) && (
                <div className="errand-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => changeStatus(errand)}
                    disabled={busyId === errand.id}
                  >
                    {errand.status === "completed" ? "Mark pending" : "Mark completed"}
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => removeErrand(errand.id)}
                    disabled={busyId === errand.id}
                  >
                    Remove
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Errands;