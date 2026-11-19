import { useState } from "react";
import { Link } from "../context/RouterContext";
import { useReviews } from "../context/ReviewsContext";

function Reviews() {
  const { reviews, isLoading, loadError, addReview } = useReviews();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSending(true);
    setStatus("");

    const newReview = {
      name: name.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addReview(newReview);
      setName("");
      setRating(5);
      setComment("");
      setStatus("Thank you for sharing your feedback!");
    } catch {
      setStatus("Could not post review. Make sure the server is running.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section id="reviews" className="reviews">
      <h2>What our clients say</h2>

      {isLoading && <p className="api-message">Loading reviews…</p>}
      {loadError && <p className="api-message" role="alert">{loadError}</p>}
      <div className="reviews-grid">
        {reviews.map((review) => (
          <Link
            key={review.id}
            to={`/reviews/${encodeURIComponent(review.id)}`}
            className="review-card review-card-link"
          >
            <div
              className="review-stars"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            <p className="review-text">“{review.comment}”</p>
            <span className="review-author">— {review.name}</span>
          </Link>
        ))}
      </div>

      <div className="feedback-box">
        <h3>Leave feedback</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            aria-label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="rating-picker">
            <span>Your rating:</span>
            <div className="star-buttons">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Tell us about your errand experience..."
            aria-label="Tell us about your errand experience"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <button type="submit" className="btn" disabled={isSending}>
            {isSending ? "Posting..." : "Submit feedback"}
          </button>
        </form>
        {status && <p id="form-message">{status}</p>}
      </div>
    </section>
  );
}

export default Reviews;