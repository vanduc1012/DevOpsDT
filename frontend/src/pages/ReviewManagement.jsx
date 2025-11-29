import React, { useState, useEffect } from 'react';
import { reviewService } from '../api/services';

function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    menuItemId: '',
    userId: ''
  });

  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.menuItemId) params.menuItemId = filters.menuItemId;
      if (filters.userId) params.userId = filters.userId;

      const response = await reviewService.getAll(params);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      alert('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await reviewService.updateStatus(reviewId, newStatus);
      alert('Đã cập nhật trạng thái đánh giá');
      loadReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewService.delete(reviewId);
      alert('Đã xóa đánh giá');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { text: 'Chờ duyệt', color: '#ffc107', bg: '#fff3cd' },
      APPROVED: { text: 'Đã duyệt', color: '#28a745', bg: '#d4edda' },
      REJECTED: { text: 'Đã từ chối', color: '#dc3545', bg: '#f8d7da' }
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: badge.color,
        background: badge.bg
      }}>
        {badge.text}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: '1rem',
              color: star <= rating ? '#ffc107' : '#ddd'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2>⭐ Quản Lý Đánh Giá</h2>

        {/* Filters */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '200px' }}>
            <label>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nhận xét</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có đánh giá nào
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div>
                        <strong>{review.menuItemId?.name || 'N/A'}</strong>
                        {review.menuItemId?._id && (
                          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                            ID: {review.menuItemId._id.toString().substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {review.userId?.fullName || review.userId?.username || 'N/A'}
                    </td>
                    <td>
                      {renderStars(review.rating)}
                      <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                        ({review.rating}/5)
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      {review.comment ? (
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={review.comment}>
                          {review.comment}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>Không có nhận xét</span>
                      )}
                    </td>
                    <td>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      {getStatusBadge(review.status)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {review.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(review._id, 'APPROVED')}
                            className="btn btn-success"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            Duyệt
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(review._id, 'REJECTED')}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            Từ chối
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
          Tổng số: <strong>{reviews.length}</strong> đánh giá
        </div>
      </div>
    </div>
  );
}

export default ReviewManagement;

