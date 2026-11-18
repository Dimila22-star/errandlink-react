import { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ReviewsContext = createContext(null);

async function requestJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    requestJson(`${API_URL}/reviews`)
      .then((data) => {
        if (isMounted) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setLoadError("Reviews could not be loaded right now.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function addReview(review) {
    const savedReview = await requestJson(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });

    setReviews((current) => [savedReview, ...current]);
    return savedReview;
  }

  async function deleteReview(id) {
    await requestJson(`${API_URL}/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setReviews((current) => current.filter((review) => `${review.id}` !== id));
  }

  return (
    <ReviewsContext.Provider
      value={{ reviews, isLoading, loadError, addReview, deleteReview }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);

  if (!context) throw new Error("useReviews must be used within ReviewsProvider");
  return context;
}
