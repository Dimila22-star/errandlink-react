import { useState } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { Link, useRouter } from "../context/RouterContext";
import { useReviews } from "../context/ReviewsContext";

function ReviewDetail({ reviewId }) {
  const { reviews, isLoading, loadError, deleteReview } = useReviews();
  const { navigate } = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const review = reviews.find((item) => `${item.id}` === reviewId);

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    try {
      await deleteReview(reviewId);
      navigate("/reviews");
    } catch {
      setError("We couldn't delete this review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="detail-page">
        <Link to="/reviews" className="text-link">← Back to reviews</Link>
        {isLoading ? (
          <p>Loading review…</p>
        ) : review ? (
          <article className="review-detail">
            <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </p>
            <h1>Review from {review.name}</h1>
            <p className="review-text">“{review.comment}”</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete review"}
            </button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </article>
        ) : (
          <article className="review-detail">
            <h1>Review not found</h1>
            <p>{loadError || "This review may have been removed."}</p>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}

export default ReviewDetail;
