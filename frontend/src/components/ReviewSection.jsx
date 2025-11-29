import React, { useState, useEffect } from 'react';
import { reviewService } from '../api/services';
import { authService } from '../api/services';

function ReviewSection({ menuItemId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [menuItemId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getByMenuItem(menuItemId);
      setReviews(response.data || []);
      
      // Check if user has already reviewed
      if (user) {
        const myReview = response.data?.find(r => r.userId?._id === user.id || r.userId?._id === user._id);
        setUserReview(myReview || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewService.getStats(menuItemId);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        // Update existing review
        await reviewService.update(userReview._id, { rating, comment });
        alert('Đã cập nhật đánh giá của bạn!');
      } else {
        // Create new review
        await reviewService.create({ menuItemId, rating, comment });
        alert('Cảm ơn bạn đã đánh giá!');
      }
      setShowForm(false);
      setComment('');
      setRating(5);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewService.delete(userReview._id);
      alert('Đã xóa đánh giá');
      setUserReview(null);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const renderStars = (ratingValue, interactive = false, size = '1.2rem') => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={interactive ? () => setRating(star) : undefined}
            style={{
              fontSize: size,
              color: star <= ratingValue ? '#ffc107' : '#ddd',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải đánh giá...</div>;
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '1rem', color: '#6f4e37' }}>⭐ Đánh Giá & Nhận Xét</h3>

      {/* Stats */}
      {stats && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f4e37' }}>
              {stats.averageRating.toFixed(1)}
            </div>
            <div>
              {renderStars(Math.round(stats.averageRating))}
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                {stats.totalReviews} đánh giá
              </div>
            </div>
          </div>
          {stats.ratingDistribution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ minWidth: '60px' }}>{star} sao</span>
                    <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: '#ffc107',
                          transition: 'width 0.3s'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#666', minWidth: '40px' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {user && (
        <div style={{ marginBottom: '1.5rem' }}>
          {!showForm && !userReview ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ width: 'auto' }}
            >
              ✍️ Viết đánh giá
            </button>
          ) : showForm && !userReview ? (
            <form onSubmit={handleSubmit} style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '1rem' }}>Đánh giá của bạn</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Đánh giá:</label>
                {renderStars(rating, true)}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nhận xét (tùy chọn):</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setComment('');
                    setRating(5);
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : userReview ? (
            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '2px solid #6f4e37' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <strong>Đánh giá của bạn</strong>
                  <div style={{ marginTop: '0.25rem' }}>{renderStars(userReview.rating)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setRating(userReview.rating);
                      setComment(userReview.comment || '');
                      setShowForm(true);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              {userReview.comment && (
                <p style={{ marginTop: '0.5rem', color: '#666' }}>{userReview.comment}</p>
              )}
              {showForm && (
                <form onSubmit={handleSubmit} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Đánh giá:</label>
                    {renderStars(rating, true)}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nhận xét:</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setRating(userReview.rating);
                        setComment(userReview.comment || '');
                      }}
                      className="btn btn-secondary"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 style={{ marginBottom: '1rem' }}>Tất cả đánh giá ({reviews.length})</h4>
        {reviews.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{review.userId?.fullName || review.userId?.username || 'Khách'}</strong>
                    <div style={{ marginTop: '0.25rem' }}>{renderStars(review.rating, false, '1rem')}</div>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {review.comment && (
                  <p style={{ marginTop: '0.5rem', color: '#333', lineHeight: '1.6' }}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewSection;

