// import style from "./GenerativeTokenCard.module.scss"
import Link from "next/link"
import cs from "classnames"
import { GenerativeToken } from "../../types/entities/GenerativeToken"
import colors from "../../styles/Colors.module.css"
import text from "../../styles/Text.module.css"
import { AnchorForward } from "../Utils/AnchorForward"
import { Card } from "./Card"
import { MintProgress } from "../Artwork/MintProgress"
import { Spacing } from "../Layout/Spacing"
import { genTokCurrentPrice, getGenerativeTokenUrl } from "../../utils/generative-token"
import { EntityBadge } from "../User/EntityBadge"
import { MintingState } from "../GenerativeToken/MintingState/MintingState"
import { DisplayTezos } from "../Display/DisplayTezos"


interface Props {
  token: GenerativeToken
  className?: string
  displayPrice?: boolean
  displayDetails?: boolean
  lockedUntil?: string
}

export function GenerativeTokenCard({
  token,
  displayPrice = false,
  displayDetails = true,
  className,
  lockedUntil,
}: Props) {
  const url = getGenerativeTokenUrl(token)

  return (
    <Link href={url} passHref>
      <AnchorForward style={{ height: '100%' }} className={className}>
        <Card
          thumbnailUri={token.thumbnailUri}
          displayDetails={displayDetails}
        >
          <div>
            <h5>{ token.name }</h5>
            <Spacing size="2x-small" />
            <EntityBadge
              user={token.author}
              size="regular"
              hasLink={false}
            />
            <Spacing size="2x-small" />
            <MintingState
              token={token}
            />
          </div>

          <div className={cs(text.small)}>
            <MintProgress 
              balance={token.balance}
              supply={token.supply}
              originalSupply={token.originalSupply}
            >
              {displayPrice && (
                <div>
                  <strong className={cs(colors.secondary, text.regular)}>
                    <DisplayTezos
                      mutez={genTokCurrentPrice(token)}
                      formatBig={false}
                      tezosSize="regular"
                    />
                  </strong>
                  {!!token.pricingDutchAuction && (
                    <i 
                      className={cs(
                        "fa-solid fa-arrow-down-right",
                        colors['gray-light'],
                      )}
                    />
                  )}
                </div>
              )}
            </MintProgress>
          </div>
        </Card>
      </AnchorForward>
    </Link>
  )
}
