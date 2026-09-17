import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-header">
        <img src={review.avatar} alt={review.name} className="review-avatar" />
        <div>
          <h4>{review.name}</h4>
          <p>{review.role} · {review.company}</p>
        </div>
      </div>

      <StarRating value={review.rating} />

      <p className="review-copy">“{review.review}”</p>

      <div className="review-meta">
        <span className={`status-badge ${review.status}`}>{review.status}</span>
        {review.featured && <span className="featured-pill">Featured</span>}
      </div>
    </article>
  );
}
