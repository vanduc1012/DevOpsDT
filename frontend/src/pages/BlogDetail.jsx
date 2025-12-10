import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import blogPosts from '../data/blogPosts';

function BlogDetail() {
  const { slug } = useParams();
  const { language, t } = useLanguage();

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container">
        <div className="card">
          <h2>{t('common.error')}</h2>
          <p>Article not found.</p>
          <Link to="/">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  const content = post.content[language] || post.content['vi-VN'];

  return (
    <div className="container">
      <div className="card">
        <div className="home-section-header" style={{ marginBottom: '1rem' }}>
          <div>
            <p>{t('home.blogSubtitle')}</p>
            <h2>{t(post.titleKey)}</h2>
          </div>
        </div>

        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#444', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-secondary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;

