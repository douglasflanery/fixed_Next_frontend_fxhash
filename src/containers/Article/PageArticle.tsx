import React, { memo, useContext, useMemo } from 'react';
import style from "./PageArticle.module.scss";
import { NFTArticle } from "../../types/entities/Article";
import { UserBadge } from "../../components/User/UserBadge";
import { format } from "date-fns";
import { ArticleInfos } from "./ArticleInfos";
import Head from "next/head";
import { Spacing } from "../../components/Layout/Spacing";
import cs from "classnames";
import layout from "../../styles/Layout.module.scss";
import text from "../../styles/Text.module.css";
import { CardSmallNftArticle } from "../../components/Card/CardSmallNFTArticle";
import { NftArticle } from '../../components/NFTArticle/NFTArticle';
import { ImagePolymorphic } from '../../components/Medias/ImagePolymorphic';
import { UserContext } from '../UserProvider';
import { isUserOrCollaborator } from '../../utils/user';
import { User } from '../../types/entities/User';
import Link from 'next/link';
import { Button } from '../../components/Button';

interface PageArticleProps {
  article: NFTArticle
  isPreview?: boolean,
  originUrl: string
}

const _PageArticle = ({ article, originUrl, isPreview }: PageArticleProps) => {
  const { id, title, description, author, createdAt, body, language, relatedArticles } = article
  const dateCreatedAt = useMemo(() => new Date(createdAt), [createdAt])
  const { user } = useContext(UserContext)

  // is it the author or a collaborator ?
  const isAuthor = useMemo(
    () => user && author && isUserOrCollaborator(user as User, author),
    [user, author]
  )

  return (
    <>
      <Head>
        <title>fxhash — {isPreview ? '[Preview] - ' : ''}{title}</title>
        <meta key="og:title" property="og:title" content={`fxhash - ${title}`} />
        <meta key="description" name="description" content={article.description} />
        <meta key="og:description" property="og:description" content={article.description} />
        <meta key="og:type" property="og:type" content="website"/>
        <meta key="og:image" property="og:image" content={article.displayUri} />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css" crossOrigin="anonymous" />
        <link href="/highlight/prism-dracula.css" rel="stylesheet"/>
        <link rel="stylesheet" href="/highlight/dracula.css"/>
      </Head>

      <Spacing size="small" />

      <main className={cs(layout['padding-big'])}>
        <div className={style.header}>
          {isAuthor && !isPreview && (
            <div className={cs(style.actions)}>
              <Link href={`/article/editor/${id}`} passHref>
                <Button
                  isLink
                  size="small"
                  color="black"
                  iconComp={<i className="fa-solid fa-pen-to-square" aria-hidden/>}
                >
                  edit article
                </Button>
              </Link>
            </div>
          )}
          {author &&
            <UserBadge
              user={author}
              hasLink
              size="big"
            />
          }
          <div className={style.date}>
            <time dateTime={format(dateCreatedAt, 'yyyy/MM/dd')}>
              {format(dateCreatedAt, 'MMMM d, yyyy')}
            </time>
          </div>
          <h1 className={cs(style.title)}>{title}</h1>
          <p className={cs(style.description, style.awidth)}>
            {description}
          </p>
          <figure className={cs(style.thumbnail)}>
            <ImagePolymorphic
              uri={article.displayUri}
            />
            {false && (
              <figcaption></figcaption>
            )}
          </figure>
        </div>
        <article lang={language} className={style.body}>
          <NftArticle
            markdown={body}
          />
        </article>
        <div className={style.infos}>
          <ArticleInfos
            article={article}
            originUrl={originUrl}
            isPreview={isPreview}
          />
        </div>
        {relatedArticles?.length > 0 &&
          <div className={style['related-articles']}>
            <h2 className={text.small_title}>Related articles</h2>
            <div className={style['related-articles_list']}>
              {relatedArticles.map((a, index) =>
                <CardSmallNftArticle key={index} article={a}/>
              )}
            </div>
          </div>
        }
      </main>
      <Spacing size="6x-large" />
    </>
  );
};

export const PageArticle = memo(_PageArticle);
