// import style from "./GenerativeTokenCard.module.scss"
import Link from "next/link"
import cs from "classnames"
import { AnchorForward } from "../Utils/AnchorForward"
import { Card } from "./Card"
import { UserBadge } from "../User/UserBadge"
import style from "./Card.module.scss"
import { Spacing } from "../Layout/Spacing"
import { Objkt } from "../../types/entities/Objkt"
import { displayMutez } from "../../utils/units"

interface Props {
  objkt: Objkt
}

export function ObjktCard({
  objkt
}: Props) {
  const owner = objkt.offer ? objkt.offer.issuer : objkt.owner!
  const url = `/objkt/${objkt.id}`

  return (
    <Link href={url} passHref>
      <AnchorForward style={{ height: '100%' }}>
        <Card thumbnailUri={objkt.metadata?.thumbnailUri}>
          <div>
            <h5>{ objkt.name }</h5>
            <Spacing size="2x-small" />
            <UserBadge user={owner} size="regular" hasLink={false} />
          </div>

          <Spacing size="small" />

          <div className={cs(style.bottom)}>
            <div className={cs(style.price)}>
              {objkt.offer && (
                <>{displayMutez(objkt.offer.price)} tez</>
              )}
            </div>
            <div className={cs(style.badge)}>
              created by 
              <UserBadge user={objkt.issuer.author} size="regular" hasLink={false} avatarSide="right" />
            </div>
          </div>
        </Card>
      </AnchorForward>
    </Link>
  )
}