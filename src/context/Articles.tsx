import React, { useMemo, useReducer } from "react"
import { useClientAsyncEffect } from "../utils/hookts"
import { DraftNFTArticle, NFTArticleForm } from "../types/ArticleEditor/Editor";

interface ArticlesState {
  articles: {
    [key: string]: DraftNFTArticle | null,
  }
}
type ArticlesAction =
  | { type: "loadAll" }
  | { type: "save", payload: { id: string, articleForm: NFTArticleForm } }
  | { type: "delete", payload: { id: string } }
interface Context {
  state: ArticlesState;
  dispatch: React.Dispatch<ArticlesAction>;
}

const initialState = { articles: {} }
const localStorageKey = 'local_articles';
export const ArticlesContext = React.createContext<Context>({} as Context)

const loadAllLocalArticles = () => {
  const localArticlesValue = localStorage.getItem(localStorageKey);
  return localArticlesValue ? JSON.parse(localArticlesValue) : initialState;
};
const articlesReducer = (state: ArticlesState, action: ArticlesAction): ArticlesState => {
  switch (action.type) {
    case "loadAll":
      return loadAllLocalArticles();
    case "save": {
      const newState = { ...state };
      newState.articles[action.payload.id] = {
        form: action.payload.articleForm,
        lastSavedAt: new Date().toUTCString(),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(newState));
      return newState;
    }
    case "delete": {
      const newState = { ...state };
      delete newState.articles[action.payload.id];
      localStorage.setItem(localStorageKey, JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
}
interface ArticlesProviderProps {
  children: any;
}
export const ArticlesProvider = ({ children }: ArticlesProviderProps) => {
  const [state, dispatch] = useReducer<React.Reducer<ArticlesState, ArticlesAction>>(articlesReducer, initialState);
  const providerValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );
  useClientAsyncEffect(() => {
    dispatch({ type: "loadAll" });
  }, [dispatch]);
  return <ArticlesContext.Provider value={providerValue}>{children}</ArticlesContext.Provider>;
}
