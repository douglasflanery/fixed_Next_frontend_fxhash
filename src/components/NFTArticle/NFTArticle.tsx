import React, { memo, useEffect, useState } from 'react';
import { getNFTArticleComponentsFromMarkdown } from "./NFTArticleProcessor";

interface NftArticleProps {
  markdown: string,
}

const _NftArticle = ({ markdown }: NftArticleProps) => {
  const [content, setContent] = useState<React.FunctionComponent | null>(null);
  useEffect(() => {
    const getNFTArticle = async () => {
      const data: any = await getNFTArticleComponentsFromMarkdown(markdown);
      if (data?.content) {
        setContent(data.content);
      }
    };
    getNFTArticle();
  }, [markdown])
  return (
    <>
      <div>
        <div>article</div>
        {content}
      </div>
    </>
  );
};

export const NftArticle = memo(_NftArticle);
