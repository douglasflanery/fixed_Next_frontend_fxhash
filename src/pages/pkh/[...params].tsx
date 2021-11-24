import { GetServerSideProps, NextPage } from "next"
import Head from "next/head"
import cs from "classnames"
import client from "../../services/ApolloClient"
import { User } from '../../types/entities/User'
import { Spacing } from '../../components/Layout/Spacing'
import { Qu_user } from '../../queries/user'
import { UserProfile } from "../../containers/User/UserProfile"
import { getUserName } from "../../utils/user"
import { useMemo } from "react"
import { ipfsGatewayUrl } from "../../services/Ipfs"
import { truncateEnd } from "../../utils/strings"


interface Props {
  user: User
}

const UserPage: NextPage<Props> = ({ user }) => {
  // find the lastest work/item of the user
  const ogImageUrl = useMemo<string|null>(() => {
    let url = null
    if (user.generativeTokens && user.generativeTokens?.length > 0) {
      url = user.generativeTokens[0].metadata.displayUri
    }
    if(!url && user.objkts && user.objkts.length > 0) {
      url = user.objkts[0].metadata?.displayUri
    }
    return (url && ipfsGatewayUrl(url)) || null
  }, [])

  return (
    <>
      <Head>
        <title>fxhash — {getUserName(user)} profile</title>
        <meta key="og:title" property="og:title" content={`fxhash — ${getUserName(user)} profile`}/> 
        <meta key="description" name="description" content={truncateEnd(user.metadata?.description || "", 200, "")}/>
        <meta key="og:description" property="og:description" content={truncateEnd(user.metadata?.description || "", 200, "")}/>
        <meta key="og:type" property="og:type" content="website"/>
        <meta key="og:image" property="og:image" content={ogImageUrl || "https://www.fxhash.xyz/images/og/og1.jpg"}/>
      </Head>
      
      <Spacing size="6x-large" />
      <UserProfile user={user} />
      <Spacing size="6x-large" />
      <Spacing size="6x-large" />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pkh = context.params?.params && context.params.params[0]
  let user = null

  if (pkh) {
    const { data, error } = await client.query({
      query: Qu_user,
      fetchPolicy: "no-cache",
      variables: { id: pkh }
    })
    if (data) {
      user = data.user
    }
  }
  return {
    props: {
      user
    },
    notFound: !user
  }
}

export default UserPage