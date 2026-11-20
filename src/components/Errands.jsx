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
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(null);

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

  function startEditing(errand) {
    setEditingId(errand.id);
    setEditForm({
      name: errand.name,
      email: errand.email,
      message: errand.message,
      imageUrl: errand.imageUrl || "",
    });
    setStatus("");
  }

  async function saveErrand(event, id) {
    event.preventDefault();
    if (!editForm) return;

    setBusyId(id);
    setStatus("");
    try {
      await updateErrand(id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        message: editForm.message.trim(),
        imageUrl: editForm.imageUrl.trim(),
      });
      setEditingId("");
      setEditForm(null);
      setStatus("Your errand request has been updated.");
    } catch {
      setStatus("We could not update that request. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  async function removeErrand(id) {
    if (!window.confirm("Remove this errand request?")) return;

    setBusyId(id);
    try {
      await deleteErrand(id);
      if (editingId === id) {
        setEditingId("");
        setEditForm(null);
      }
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
              {editingId === errand.id && editForm ? (
                <form
                  className="errand-form errand-edit-form"
                  onSubmit={(event) => saveErrand(event, errand.id)}
                >
                  <label>
                    Name
                    <input
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm({ ...editForm, name: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm({ ...editForm, email: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Image URL <span className="optional-label">(optional)</span>
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(event) =>
                        setEditForm({ ...editForm, imageUrl: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    What do you need?
                    <textarea
                      value={editForm.message}
                      onChange={(event) =>
                        setEditForm({ ...editForm, message: event.target.value })
                      }
                      required
                    />
                  </label>
                  <div className="errand-actions">
                    <button type="submit" className="btn" disabled={busyId === errand.id}>
                      {busyId === errand.id ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId("");
                        setEditForm(null);
                      }}
                      disabled={busyId === errand.id}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
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
              )}
              {canManage(errand) && (
                <div className="errand-actions">
                  {editingId !== errand.id && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => startEditing(errand)}
                        disabled={busyId === errand.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => changeStatus(errand)}
                        disabled={busyId === errand.id}
                      >
                        {errand.status === "completed" ? "Mark pending" : "Mark completed"}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => removeErrand(errand.id)}
                    disabled={busyId === errand.id}
                  >
                    Delete
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