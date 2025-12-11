import React, { useEffect, useState } from 'react';
import { blogService } from '../api/services';

const emptyForm = {
  title: '',
  slug: '',
  summary: '',
  coverImage: '',
  category: 'Tin tức',
  author: 'NV Quán',
  status: 'published',
  content: '',
};

function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await blogService.listAdmin({ all: true, limit: 100 });
      setPosts(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Load blog posts failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const payload = {
      ...form,
      content: form.content.split('\n').map((p) => p.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await blogService.update(editingId, payload);
        setMessage('Đã cập nhật bài viết');
      } else {
        await blogService.create(payload);
        setMessage('Đã tạo bài viết mới');
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchPosts();
    } catch (error) {
      console.error('Save blog failed', error);
      setMessage('Lỗi khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      summary: post.summary || '',
      coverImage: post.coverImage || '',
      category: post.category || 'Tin tức',
      author: post.author || 'NV Quán',
      status: post.status || 'draft',
      content: (post.content || []).join('\n'),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài viết này?')) return;
    try {
      await blogService.delete(id);
      setMessage('Đã xóa bài viết');
      fetchPosts();
    } catch (error) {
      console.error('Delete blog failed', error);
      setMessage('Lỗi khi xóa');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>
          {editingId ? 'Chỉnh sửa bài viết' : 'Đăng bài blog mới'}
        </h2>
        <p style={{ color: '#6b4423', marginTop: 0, marginBottom: '1rem' }}>
          Admin có thể thêm, sửa, xóa bài blog để hiển thị ở trang Tin tức.
        </p>
        {message && (
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '0.75rem' }}>
          <div className="form-group">
            <label>Tiêu đề</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Slug (tùy chọn)</label>
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="vd: hanh-trinh-hat-ca-phe" />
          </div>
          <div className="form-group">
            <label>Tác giả</label>
            <input name="author" value={form.author} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Chủ đề / Category</label>
            <input name="category" value={form.category} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Ảnh cover (URL)</label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="/blogimages/anh1.jpg" />
          </div>
          <div className="form-group">
            <label>Tóm tắt</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} rows={2} />
          </div>
          <div className="form-group">
            <label>Nội dung (mỗi dòng là một đoạn)</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={6} />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="published">Xuất bản</option>
              <option value="draft">Nháp</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Đăng bài'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="home-section-header">
          <div>
            <p>Quản lý bài viết</p>
            <h3>Danh sách blog</h3>
          </div>
          <span>{posts.length} bài</span>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Chủ đề</th>
                  <th>Ngày cập nhật</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.status}</td>
                    <td>{p.category}</td>
                    <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}</td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary" onClick={() => handleEdit(p)}>Sửa</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="5">Chưa có bài viết.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogAdmin;

