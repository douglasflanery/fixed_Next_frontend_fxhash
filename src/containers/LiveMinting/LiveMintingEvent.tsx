import React, { memo, useContext } from "react"
import { useRouter } from "next/router"
import style from "./LiveMintingEvent.module.scss"
import cs from "classnames"
import text from "../../styles/Text.module.css"
import { gql, useQuery } from "@apollo/client"
import {
  Frag_GenAuthor,
  Frag_GenPricing,
  Frag_GenReserves,
} from "../../queries/fragments/generative-token"
import { CardsLoading } from "../../components/Card/CardsLoading"
import { GenerativeToken } from "../../types/entities/GenerativeToken"
import { LiveMintingGenerativeTokenCard } from "../../components/Card/LiveMintingGenerativeTokenCard"
import { LiveMintingContext } from "../../context/LiveMinting"
import Link from "next/link"

// replace with event tokens
const Qu_genTokens = gql`
  ${Frag_GenAuthor}
  ${Frag_GenPricing}
  ${Frag_GenReserves}

  query GenerativeTokens(
    $skip: Int
    $take: Int
    $sort: GenerativeSortInput
    $filters: GenerativeTokenFilter
  ) {
    generativeTokens(skip: $skip, take: $take, sort: $sort, filters: $filters) {
      id
      name
      slug
      thumbnailUri
      flag
      labels
      ...Pricing
      supply
      originalSupply
      balance
      enabled
      royalties
      createdAt
      ...Reserves
      ...Author
    }
  }
`
interface LiveMintingEventProps {}

const _LiveMintingEvent = ({}: LiveMintingEventProps) => {
  const router = useRouter()
  const { event, paidLiveMinting } = useContext(LiveMintingContext)
  const { id, ...liveMintingQuery } = router.query

  const { data, loading } = useQuery(Qu_genTokens, {
    notifyOnNetworkStatusChange: true,
    variables: {
      skip: 0,
      take: 10,
      filters: {
        id_in: event!.projectIds,
      },
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network",
  })
  const generativeTokens: GenerativeToken[] = data?.generativeTokens

  return (
    <div className={style.container}>
      <p>
        These projects were created especially for this event.
        {paidLiveMinting && (
          <>
            <br />
            Make sure you have enough tezos in your wallet before minting.
          </>
        )}
      </p>
      <div className={style.container_token}>
        {generativeTokens?.length > 0 &&
          generativeTokens.map((token) => (
            <Link
              key={token.id}
              href={`/live-minting/${event!.id}/generative/${
                token.id
              }/?${new URLSearchParams(liveMintingQuery as any).toString()}`}
            >
              <a className={cs(text.reset, style.token)}>
                <LiveMintingGenerativeTokenCard
                  token={token}
                  displayPrice={!!paidLiveMinting}
                  displayDetails
                />
              </a>
            </Link>
          ))}
        {loading &&
          CardsLoading({
            number: 10,
          })}
      </div>
    </div>
  )
}

export const LiveMintingEvent = memo(_LiveMintingEvent)
