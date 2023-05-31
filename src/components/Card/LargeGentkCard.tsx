// import style from "./GenerativeTokenCard.module.scss"
import Link from "next/link"
import style from "./LargeGentkCard.module.scss"
import colors from "styles/Colors.module.css"
import cs from "classnames"
import { AnchorForward } from "../Utils/AnchorForward"
import { UserBadge } from "../User/UserBadge"
import { Spacing } from "../Layout/Spacing"
import { Objkt } from "../../types/entities/Objkt"
import { getObjktUrl } from "../../utils/objkt"
import { GenTokFlag } from "../../types/entities/GenerativeToken"
import { useContext } from "react"
import { SettingsContext } from "../../context/Theme"
import { DisplayTezos } from "../Display/DisplayTezos"
import { LargeCard } from "./LargeCard"
import { HoverTitle } from "components/Utils/HoverTitle"
import { Icon } from "components/Icons/Icon"

const RedeemableDetail = ({ objkt }: { objkt: Objkt }) => {
  if (objkt.availableRedeemables.length > 0)
    return (
      <HoverTitle message="Redeemable">
        <Icon icon="sparkles" className={cs(colors["gray-light"])} />
      </HoverTitle>
    )

  return (
    <HoverTitle message="This token has been redeemed">
      <Icon icon="sparkle" className={cs(colors["gray-light"])} /> Redeemed
    </HoverTitle>
  )
}

interface Props {
  objkt: Objkt
  showOwner?: boolean
  showRarity?: boolean
}

export function LargeGentkCard({
  objkt,
  showOwner = true,
  showRarity = false,
}: Props) {
  const url = getObjktUrl(objkt)
  const settings = useContext(SettingsContext)
  const isProjectRedeemable = objkt.issuer.redeemables.length > 0
  return (
    <Link href={url} passHref>
      <AnchorForward className={style.root} style={{ height: "100%" }}>
        <LargeCard
          tokenLabels={objkt.issuer?.labels}
          image={objkt.captureMedia}
          thumbnailUri={objkt.metadata?.displayUri}
          undesirable={objkt.issuer?.flag === GenTokFlag.MALICIOUS}
          displayDetails={settings.displayInfosGentkCard}
          topper={
            <div className={cs(style.topper)}>
              <div className={cs(style.left_topper)}>
                <span>#{objkt.iteration}</span>
                {isProjectRedeemable && <RedeemableDetail objkt={objkt} />}
              </div>
              {objkt.duplicate && (
                <div className={cs(style.dup_flag)}>[WARNING: DUPLICATE]</div>
              )}
              {showRarity && objkt.rarity != null && (
                <>
                  <Spacing size="2x-small" />
                  <div className={cs(style.rarity)}>
                    Rarity: {objkt.rarity.toFixed(3)}
                  </div>
                </>
              )}
            </div>
          }
        >
          <div className={cs(style.bottom)}>
            {showOwner && (
              <>
                <UserBadge
                  user={objkt.owner!}
                  size="small"
                  hasLink={false}
                  className={cs(style.badge)}
                  hasVerified={false}
                />
              </>
            )}
            {objkt.activeListing && (
              <DisplayTezos
                mutez={objkt.activeListing.price!}
                formatBig={false}
                className={cs(style.tezos)}
              />
            )}
          </div>
        </LargeCard>
      </AnchorForward>
    </Link>
  )
}
