import { GetServerSideProps } from "next"
import Head from "next/head"
import { Spacing } from "../../../../../components/Layout/Spacing"
import layout from "../../../../../styles/Layout.module.scss"
import text from "../../../../../styles/Text.module.css"
import color from "../../../../../styles/Colors.module.css"
import cs from "classnames"
import client from "../../../../../services/ApolloClient"
import { GenerativeToken } from "../../../../../types/entities/GenerativeToken"
import { Qu_genToken } from "../../../../../queries/generative-token"
import { Article } from "../../../../../components/Article/Article"
import { EntityBadge } from "../../../../../components/User/EntityBadge"
import { Reveal } from "../../../../../containers/Reveal/Reveal";
import { LayoutMinimalist } from "../../../../../components/Layout/LayoutMinimalist";
import { NextPageWithLayout } from "../../../../_app";
import { LiveMintingLayout } from "../../../../../containers/LiveMinting/LiveMintingLayout"

interface Props {
  hash: string
  token: GenerativeToken
}

const LiveMintingRevealPage: NextPageWithLayout<Props> = ({ hash, token }) => {
  return (
    <>
      <Head>
        <title>fxhash — reveal token</title>
        <meta key="og:title" property="og:title" content="fxhash — reveal gentk"/>
        <meta key="description" name="description" content="Reveal a gentk minted from fxhash"/>
        <meta key="og:description" property="og:description" content="Reveal a gentk minted from fxhash"/>
        <meta key="og:type" property="og:type" content="website"/>
        <meta key="og:image" property="og:image" content="https://www.fxhash.xyz/images/og/og1.jpg"/>
      </Head>
      <section>
        <Spacing size="3x-large"/>
        <main className={cs(layout['padding-big'])}>
          <div className={cs(layout.y_centered)}>
            <span className={cs(text.small, color.gray)}>this is your unique iteration of</span>
            <Spacing size="8px"/>
            <h2>{ token.name }</h2>
            <Spacing size="8px"/>
            <div className={cs(layout.x_centered)}>
              <span style={{ marginRight: 10 }}>created by </span>
              <EntityBadge
                size="regular"
                user={token.author}
                toggeable
              />
            </div>
          </div>
          <Spacing size="3x-large"/>
          <Reveal
            hash={hash}
            generativeUri={token.metadata.generativeUri}
          />
          <Article className={cs(layout.small_centered)}>
            <p>
              Your token will now have to go through a <strong>signing process</strong>. No more actions are required from yourself, this happens automatically in the back stage ! Until this process is finished, your token will appear as <strong>[waiting to be signed]</strong> in your wallet and on fxhash.
            </p>
            <p>
              During the signing, fxhash servers will generate the token metadata and send it to the blockchain. This process is required for a few reasons:
            </p>
            <ul>
              <li>an image preview of the token needs to be generated for it to be displayed on any platform properly</li>
              <li>features need to be extracted from the program</li>
            </ul>
            <p>
              The signing of the metadata can only happen once, and once done your token become immutable on the blockchain.
            </p>
          </Article>
          <Spacing size="3x-large"/>
        </main>
      </section>
    </>
  )
}
LiveMintingRevealPage.getLayout = LiveMintingLayout

export const getServerSideProps: GetServerSideProps = async (context) => {
  const hash = context.params?.hash
  const id = context.params?.number && parseInt(context.params?.number as string)
  let token = null

  if (hash != null && id != null) {
    const { data, error } = await client.query({
      query: Qu_genToken,
      fetchPolicy: "no-cache",
      variables: {
        id
      }
    })
    if (data) {
      token = data.generativeToken
    }
  }

  return {
    props: {
      hash,
      token: token,
    },
    notFound: !token || !hash
  }
}

export default LiveMintingRevealPage
