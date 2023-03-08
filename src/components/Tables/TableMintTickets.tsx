import React, { memo, useRef } from "react"
import style from "./TableUser.module.scss"
import { UserBadge } from "../User/UserBadge"
import Skeleton from "../Skeleton"
import cs from "classnames"
import useHasScrolledToBottom from "../../hooks/useHasScrolledToBottom"
import { MintTicket } from "../../types/entities/MintTicket"
import { format, formatDistanceToNow } from "date-fns"
import { ButtonClaimMintTicket } from "../MintTicket/ButtonClaimMintTicket"
import { ButtonMintTicketPurchase } from "../MintTicket/ButtonMintTicketPurchase"
import { ButtonUpdatePriceMintTicket } from "../MintTicket/ButtonUpdatePriceMintTicket"

interface TableMintTicketsProps {
  firstColName?: string
  mintTickets: MintTicket[]
  loading?: boolean
  onScrollToBottom?: () => void
}
const _TableMintTickets = ({
  firstColName = "owner",
  mintTickets,
  loading,
  onScrollToBottom,
}: TableMintTicketsProps) => {
  const refWrapper = useRef<HTMLDivElement>(null)
  useHasScrolledToBottom(refWrapper, {
    onScrollToBottom,
    offsetBottom: 100,
  })
  return (
    <>
      <div ref={refWrapper}>
        <table className={cs(style.table)}>
          <thead>
            <tr>
              <th className={style["th-gentk"]}>{firstColName}</th>
              <th className={style["th-date"]}>Tax paid until</th>
              <th className={style["th-mint-actions"]}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading || mintTickets.length > 0 ? (
              mintTickets.map((mintTicket) => {
                const dateTaxPaidUntil = new Date(mintTicket.taxationPaidUntil)
                return (
                  <>
                    <tr key={mintTicket.id}>
                      <td
                        className={cs(
                          style["td-gentk"],
                          style.td_mobile_fullwidth
                        )}
                      >
                        <UserBadge
                          hasLink
                          user={mintTicket.owner}
                          size="small"
                          displayAvatar={true}
                        />
                      </td>

                      <td
                        data-label="Tax paid until"
                        className={style["td-date"]}
                      >
                        {format(dateTaxPaidUntil, "dd/MM/yy")} (
                        {formatDistanceToNow(dateTaxPaidUntil, {
                          addSuffix: true,
                        })}
                        )
                      </td>
                      <td
                        data-label="Actions"
                        className={style["td-mint-actions"]}
                      >
                        <ButtonClaimMintTicket mintTicket={mintTicket} />
                        <ButtonMintTicketPurchase mintTicket={mintTicket} />
                        <ButtonUpdatePriceMintTicket mintTicket={mintTicket} />
                      </td>
                    </tr>
                  </>
                )
              })
            ) : (
              <tr>
                <td
                  className={cs(style.empty, style.td_mobile_fullwidth)}
                  colSpan={5}
                >
                  No mint passes found
                </td>
              </tr>
            )}
            {loading &&
              [...Array(29)].map((_, idx) => (
                <tr key={idx}>
                  <td className={style["td-gentk"]}>
                    <div className={style["skeleton-wrapper"]}>
                      <Skeleton
                        className={style["skeleton-thumbnail"]}
                        height="40px"
                        width="40px"
                      />
                      <Skeleton height="25px" width="100%" />
                    </div>
                  </td>
                  <td data-label="Seller" className={style["td-date"]}>
                    <Skeleton height="25px" />
                  </td>
                  <td data-label="Time" className={style["td-mint-actions"]}>
                    <Skeleton height="25px" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export const TableMintTickets = memo(_TableMintTickets)
