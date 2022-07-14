import layout from "../../../../styles/Layout.module.scss"
import cs from "classnames"
import { NextPage } from "next"
import Head from "next/head"
import { ArticleEditor } from "../../../../containers/Article/Editor/ArticleEditor"
import { Spacing } from "../../../../components/Layout/Spacing"
import React, { useContext, useState } from "react";
import { ArticlesContext } from "../../../../context/Articles";
import { useRouter } from "next/router";
import { LoaderBlock } from "../../../../components/Layout/LoaderBlock";
import { Error } from "../../../../components/Error/Error";
import useInit from "../../../../hooks/useInit";
import { nanoid } from "nanoid";

const ArticleEditorPage: NextPage = () => {
  const [localId, setLocalId] = useState<string|null>(null);
  const { state } = useContext(ArticlesContext);
  useInit(() => {
    const generateId = nanoid(11);
    setLocalId(generateId);
    window.history.replaceState(null, '', `/article/editor/local/${generateId}`);
  });
  const article = localId ? state.articles[localId] : null;
  return (
    <>
      <Head>
        <title>Draft {article?.form.title && `- ${article.form.title}`}</title>
      </Head>

      <Spacing size="3x-large"/>

      <main className={cs(layout['padding-small'])}>
        {localId &&
          <ArticleEditor
            hasLocalAutosave
            localId={localId}
          />
        }
      </main>

      <Spacing size="6x-large"/>
      <Spacing size="6x-large"/>
    </>
  )
}

export default ArticleEditorPage
