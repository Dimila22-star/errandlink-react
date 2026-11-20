import { useEffect, useState } from "react";
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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    } else {
      setOnlyMine(false);
    }
  }, [user]);

  function canManage(errand) {
    return !errand.userId || Boolean(user && `${errand.userId}` === `${user.id}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) return;

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
        userId: user.id,
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
    setStatus("");
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
      status: errand.status || "pending",
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
        status: editForm.status,
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
    setStatus("");
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

  const query = search.trim().toLowerCase();
  const visibleErrands = errands.filter((errand) => {
    if (onlyMine && user && `${errand.userId}` !== `${user.id}`) return false;
    if (filter !== "all" && errand.status !== filter) return false;
    if (!query) return true;
    return (
      errand.message?.toLowerCase().includes(query) ||
      errand.name?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="detail-page errands-page">
      <section>
        <h1>Errand requests</h1>
        <p className="auth-intro">Browse requests shared by the ErrandLink community.</p>

        {user ? (
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
        ) : (
          <p className="auth-switch">
            <Link to="/login" className="text-link">Sign in</Link> or{" "}
            <Link to="/register" className="text-link">create an account</Link>{" "}
            to post a new errand request.
          </p>
        )}

        {status && <p className="form-message" role="status">{status}</p>}

        <div className="errand-filters">
          <input
            type="search"
            placeholder="Search errands..."
            aria-label="Search errands"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="filter-tabs">
            <button
              type="button"
              className={filter === "all" ? "filter-tab active" : "filter-tab"}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "pending" ? "filter-tab active" : "filter-tab"}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={filter === "completed" ? "filter-tab active" : "filter-tab"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
            {user && (
              <button
                type="button"
                className={onlyMine ? "filter-tab active" : "filter-tab"}
                onClick={() => setOnlyMine((current) => !current)}
              >
                My requests
              </button>
            )}
          </div>
        </div>

        {isLoading && <p className="api-message">Loading errand requests...</p>}
        {loadError && <p className="form-error" role="alert">{loadError}</p>}

        <div className="errands-list">
          {!isLoading && visibleErrands.length === 0 && (
            <p className="empty-state">
              {errands.length === 0
                ? "There are no errand requests yet."
                : "No errands match your filter."}
            </p>
          )}
          {visibleErrands.map((errand) => (
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
                    Status
                    <select
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm({ ...editForm, status: event.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
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
                  {!errand.userId && <span className="status status-guest">Guest</span>}
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