export default function StarRating({ value = 0, onChange, interactive = false, size = 'md' }) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="star-rating" style={{ fontSize: size === 'lg' ? '1.5rem' : '1.1rem' }}>
      {stars.map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            className={`star ${active ? 'active' : ''}`}
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
