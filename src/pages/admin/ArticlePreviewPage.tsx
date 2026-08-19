import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArticleMeta, CategoryBadge, MarkdownContent } from '../../components/ArticleParts'
import { ErrorState, Spinner } from '../../components/Ui'
import { getArticleById } from '../../services/articles'
import type { Article } from '../../types'
export function ArticlePreviewPage() {
  const { id = '' } = useParams()
  const [article, setArticle] = useState<Article | null>()
  useEffect(() => {
    getArticleById(id)
      .then(setArticle)
      .catch(() => setArticle(null))
  }, [id])
  if (article === undefined) return <Spinner />
  if (!article) return <ErrorState message="No pudimos abrir esta vista previa." />
  return (
    <>
      <div className="preview-bar">
        <span>Vista previa · {article.status === 'draft' ? 'Borrador' : 'Publicado'}</span>
        <Link to={`/admin/articles/${id}/edit`}>Volver al editor</Link>
      </div>
      <article className="article-page preview">
        <header className="article-header narrow">
          <CategoryBadge category={article.category} />
          <h1>{article.title}</h1>
          <p className="dek">{article.summary}</p>
          <ArticleMeta article={article} />
        </header>
        {article.coverImage && (
          <figure className="article-cover">
            <img src={article.coverImage} alt={article.coverImageAlt} />
          </figure>
        )}
        <div className="narrow">
          <MarkdownContent content={article.content} />
        </div>
      </article>
    </>
  )
}
