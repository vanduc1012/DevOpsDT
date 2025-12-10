import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import blogPosts from '../data/blogPosts';

// Layout wrapper: centers content, adds outer padding and background
const BlogDetailLayout = ({ children }) => (
  <div className="blog-detail-layout">
    <div className="blog-detail-card">{children}</div>
  </div>
);

// Metadata line under title
const BlogMeta = ({ date, author, category }) => (
  <div className="blog-detail-meta">
    <span>{date}</span>
    <span className="dot">•</span>
    <span>{author}</span>
    <span className="dot">•</span>
    <span>{category}</span>
  </div>
);

// Related posts list to be reused later when API is ready
const RelatedPostsSection = ({ currentSlug, posts, t }) => {
  const related = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (!related.length) return null;

  return (
    <div className="blog-detail-related">
      <h2 className="blog-detail-related-title">Bài viết khác bạn có thể thích</h2>
      <div className="blog-detail-related-grid">
        {related.map((item) => (
          <Link key={item.slug} to={`/blog/${item.slug}`} className="blog-detail-related-item">
            <span className="icon">{item.icon || '☕'}</span>
            <span className="text">{t ? t(item.titleKey) : item.titleKey}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

function BlogDetail() {
  const { slug } = useParams();
  const { language, t } = useLanguage();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <BlogDetailLayout>
        <h2 className="blog-detail-title">{t('common.error')}</h2>
        <p className="blog-detail-desc">Article not found.</p>
        <Link to="/" className="blog-detail-back">
          ← {t('common.back')}
        </Link>
      </BlogDetailLayout>
    );
  }

  const content = post.content[language] || post.content['vi-VN'];

  // Cover image: prioritize prop on post, then optional default based on slug, else placeholder
  const coverImage =
    post.coverImage || `/images/blog-${post.slug}.jpg` || '/images/coffee-cover-placeholder.jpg';

  const meta = {
    date: post.date || 'Đăng ngày 12/12/2025',
    author: post.author || 'Tác giả: NV Quán',
    category: post.category || 'Chủ đề: Kiến thức cà phê'
  };

  return (
    <BlogDetailLayout>
      <Link to="/" className="blog-detail-back">
        ← Quay lại Tin tức
      </Link>

      <img src={coverImage} alt={t(post.titleKey)} className="blog-detail-cover" />

      <h1 className="blog-detail-title">{t(post.titleKey)}</h1>
      <BlogMeta date={meta.date} author={meta.author} category={meta.category} />

      <div className="blog-detail-divider" />

      <div className="blog-detail-body">
        {content.map((paragraph, idx) => (
          <p key={idx} className="blog-detail-desc">
            {paragraph}
          </p>
        ))}

        {/* Flavor note / tips to make the page richer */}
        <div className="blog-detail-highlight">
          <h3 className="blog-detail-highlight-title">
            {language === 'en-US'
              ? 'Flavor notes & serving tips'
              : 'Ghi chú hương vị & mẹo thưởng thức'}
          </h3>
          <p className="blog-detail-desc">
            {language === 'en-US'
              ? 'Try pairing the brew with a small piece of dark chocolate to feel the contrast between sweetness and acidity.'
              : 'Hãy thử kèm một miếng chocolate đen nhỏ để cảm nhận rõ độ ngọt – chua hài hòa của tách cà phê.'}
          </p>
          <ul className="blog-detail-list">
            <li>
              {language === 'en-US'
                ? 'Grind right before brewing to keep the aromas bright.'
                : 'Xay ngay trước khi pha để hương thơm giữ được tươi sáng.'}
            </li>
            <li>
              {language === 'en-US'
                ? 'Let the coffee rest 30–40 seconds after pouring hot water for more balanced extraction.'
                : 'Cho cà phê “nở” 30–40 giây sau khi rót nước nóng để chiết xuất cân bằng hơn.'}
            </li>
            <li>
              {language === 'en-US'
                ? 'Try a lower water temperature (90–92°C) for Arabica to keep sweetness.'
                : 'Thử nhiệt nước 90–92°C với Arabica để giữ độ ngọt dịu.'}
            </li>
          </ul>
        </div>
      </div>

      <RelatedPostsSection currentSlug={slug} posts={blogPosts} t={t} />
    </BlogDetailLayout>
  );
}

export default BlogDetail;

