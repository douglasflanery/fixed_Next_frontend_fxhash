import style from "./GenerativeListings.module.scss"
import cs from "classnames"
import { useQuery } from "@apollo/client"
import { CardsContainer } from "../../components/Card/CardsContainer"
import { ObjktCard } from "../../components/Card/ObjktCard"
import { useState, useEffect, useMemo, useRef } from "react"
import { Spacing } from "../../components/Layout/Spacing"
import { IOptions, Select } from "../../components/Input/Select"
import { GenerativeToken } from "../../types/entities/GenerativeToken"
import { Objkt } from "../../types/entities/Objkt"
import { InfiniteScrollTrigger } from "../../components/Utils/InfiniteScrollTrigger"
import { CardsLoading } from "../../components/Card/CardsLoading"
import { Qu_genTokListings } from "../../queries/marketplace"
import { CardsExplorer } from "../../components/Exploration/CardsExplorer"
import { CardSizeSelect } from "../../components/Input/CardSizeSelect"
import { useRouter } from "next/router"
import { useSettingsContext } from "context/Theme"
import { useQueryParamSort } from "hooks/useQueryParamSort"

const ITEMS_PER_PAGE = 20

export type MarketplaceSortOption =
  | "listingCreatedAt-desc"
  | "listingPrice-desc"
  | "listingPrice-asc"
  | "listingCreatedAt-asc"

export const marketplaceSortOptions: IOptions<MarketplaceSortOption>[] = [
  {
    label: "recently listed",
    value: "listingCreatedAt-desc",
  },
  {
    label: "price (high to low)",
    value: "listingPrice-desc",
  },
  {
    label: "price (low to high)",
    value: "listingPrice-asc",
  },
  {
    label: "oldest listed",
    value: "listingCreatedAt-asc",
  },
]

interface Props {
  token: GenerativeToken
}

export const GenerativeListings = ({ token }: Props) => {
  const settings = useSettingsContext()
  const { sortValue, sortVariable, sortOptions, setSortValue } =
    useQueryParamSort(marketplaceSortOptions, {
      defaultSort: settings.preferredMarketplaceSorting,
    })

  // use to know when to stop loading
  const currentLength = useRef<number>(0)
  const ended = useRef<boolean>(false)

  const { data, loading, fetchMore, refetch } = useQuery(Qu_genTokListings, {
    notifyOnNetworkStatusChange: true,
    variables: {
      filters: {},
      id: token.id,
      skip: 0,
      take: ITEMS_PER_PAGE,
      sort: sortVariable,
    },
  })

  const objkts: Objkt[] | null = data?.generativeToken.activeListedObjkts

  useEffect(() => {
    if (!loading && objkts) {
      if (
        currentLength.current === objkts.length ||
        objkts.length < ITEMS_PER_PAGE
      ) {
        ended.current = true
      } else {
        currentLength.current = objkts.length
      }
    }
  }, [loading])

  const infiniteScrollFetch = () => {
    !ended.current &&
      fetchMore?.({
        variables: {
          id: token.id,
          skip: objkts?.length || 0,
          take: ITEMS_PER_PAGE,
        },
      })
  }

  useEffect(() => {
    currentLength.current = 0
    ended.current = false
    refetch?.({
      filters: {},
      id: token.id,
      skip: 0,
      take: ITEMS_PER_PAGE,
      sort: sortVariable,
    })
  }, [sortVariable])

  return (
    <CardsExplorer cardSizeScope="marketplace">
      {({ cardSize, setCardSize }) => (
        <>
          <div className={cs(style.top_bar)}>
            <CardSizeSelect value={cardSize} onChange={setCardSize} />
            <Select
              value={sortValue}
              options={sortOptions}
              onChange={setSortValue}
            />
          </div>

          <Spacing size="large" />

          <InfiniteScrollTrigger
            onTrigger={infiniteScrollFetch}
            canTrigger={!!data && !loading}
          >
            <CardsContainer>
              <>
                {objkts &&
                  objkts?.length > 0 &&
                  objkts.map((objkt) => (
                    <ObjktCard key={objkt.id} objkt={objkt} />
                  ))}
                {loading &&
                  CardsLoading({
                    number: ITEMS_PER_PAGE,
                  })}
                {!loading && objkts?.length === 0 && (
                  <p>No items currently listed</p>
                )}
              </>
            </CardsContainer>
          </InfiniteScrollTrigger>
        </>
      )}
    </CardsExplorer>
  )
}
