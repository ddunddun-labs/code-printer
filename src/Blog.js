import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './Blog.css';

function Blog({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="blog-container">
      <Helmet>
        <title>{`${t('blog.title')} - ${t('header.siteTitle')}`}</title>
        <meta name="description" content={t('blog.metaDescription')} />
      </Helmet>
      <button onClick={() => onNavigate('app')} className="back-button">
        &larr; {t('help.backToApp')}
      </button>
      <article className="blog-post">
        <h1>{t('blog.post1.title')}</h1>
        <p className="post-meta">{t('blog.post1.date')}</p>
        
        <p>{t('blog.post1.p1')}</p>

        <h2>{t('blog.post1.h2_1')}</h2>
        <p>{t('blog.post1.p2')}</p>

        <h2>{t('blog.post1.h2_2')}</h2>
        <p>{t('blog.post1.p3')}</p>

        <h2>{t('blog.post1.h2_3')}</h2>
        <p>{t('blog.post1.p4')}</p>

        <h2>{t('blog.post1.h2_4')}</h2>
        <p>{t('blog.post1.p5')}</p>

        <h2>{t('blog.post1.h2_5')}</h2>
        <p>{t('blog.post1.p6')}</p>

        <p>{t('blog.post1.p7')}</p>
      </article>
    </div>
  );
}

export default Blog;