import type { NextPage } from "next"
import { Spacing } from "../components/Layout/Spacing"
import Head from "next/head"
import { Qu_indexerStatus } from "../queries/indexer-status"
import { createApolloClient } from "../services/ApolloClient"
import { getTezosNetworkIndexerStatus } from "../services/IndexerStatus"
import { SectionTitle } from "../components/Layout/SectionTitle"
import { SectionHeader } from "../components/Layout/SectionHeader"
import { SectionWrapper } from "../components/Layout/SectionWrapper"
import { IndexerStatusDetails } from "../components/Status/IndexerStatusDetails"
import { IndexerStatusIcon } from "../components/Status/IndexerStatusIcon"
import { IndexerStatus, NetworkStatus } from "../types/IndexerStatus"
import { useIndexerStatusSeverity } from "../hooks/useIndexerStatusSeverity"

interface Props {
  tezosNetworkStatus: NetworkStatus
  indexerStatus: IndexerStatus
}

const StatusPage: NextPage<Props> = ({
  tezosNetworkStatus,
  indexerStatus,
}: Props) => {
  const severity = useIndexerStatusSeverity(indexerStatus, tezosNetworkStatus)
  return (
    <>
      <Head>
        <title>fxhash — status</title>
        <meta key="og:title" property="og:title" content="fxhash — status" />
        <meta
          key="description"
          name="description"
          content="Collect and trade your NFTs generated on fxhash"
        />
        <meta
          key="og:description"
          property="og:description"
          content="Collect and trade your NFTs generated on fxhash"
        />
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:image"
          property="og:image"
          content="https://www.fxhash.xyz/images/og/og1.jpg"
        />
      </Head>

      <Spacing size="3x-large" />

      <SectionWrapper layout="fixed-width-centered">
        <SectionHeader layout="center">
          <SectionTitle flexDirection="column">
            <IndexerStatusIcon severity={severity!} />
            Indexer status
          </SectionTitle>
        </SectionHeader>
        <Spacing size="3x-large" />
        <IndexerStatusDetails
          status={indexerStatus}
          networkStatus={tezosNetworkStatus}
        />
      </SectionWrapper>

      <Spacing size="6x-large" />
      <Spacing size="6x-large" />
      <Spacing size="6x-large" />
    </>
  )
}

export async function getServerSideProps() {
  const apolloClient = createApolloClient()
  const { data, error } = await apolloClient.query<any>({
    query: Qu_indexerStatus,
    fetchPolicy: "no-cache",
  })

  const tezosNetworkStatus = await getTezosNetworkIndexerStatus()
  console.log(tezosNetworkStatus, data)
  return {
    props: {
      indexerStatus: data.statusIndexing,
      tezosNetworkStatus,
    },
  }
}

export default StatusPage
