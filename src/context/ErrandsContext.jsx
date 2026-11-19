import { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ErrandsContext = createContext(null);

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

export function ErrandsProvider({ children }) {
  const [errands, setErrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    requestJson(`${API_URL}/requests`)
      .then((data) => {
        if (isMounted) setErrands(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setLoadError("Your errand requests could not be loaded.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function addErrand(errand) {
    const saved = await requestJson(`${API_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errand),
    });
    setErrands((current) => [saved, ...current]);
    return saved;
  }

  async function updateErrand(id, changes) {
    const saved = await requestJson(`${API_URL}/requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    setErrands((current) =>
      current.map((errand) =>
        `${errand.id}` === `${id}` ? saved : errand,
      ),
    );
    return saved;
  }

  async function deleteErrand(id) {
    await requestJson(`${API_URL}/requests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setErrands((current) =>
      current.filter((errand) => `${errand.id}` !== `${id}`),
    );
  }

  return (
    <ErrandsContext.Provider
      value={{
        errands,
        isLoading,
        loadError,
        addErrand,
        updateErrand,
        deleteErrand,
      }}
    >
      {children}
    </ErrandsContext.Provider>
  );
}

export function useErrands() {
  const context = useContext(ErrandsContext);
  if (!context) throw new Error("useErrands must be used within ErrandsProvider");
  return context;
}