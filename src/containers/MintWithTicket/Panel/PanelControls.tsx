import { useCallback, useContext, useMemo, useRef, useState } from "react"
import ReactDOM from "react-dom"
import cs from "classnames"
import { isBefore } from "date-fns"
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons"
import { useQuery } from "@apollo/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { UserContext } from "containers/UserProvider"
import { Qu_userMintTickets } from "queries/user"
import { MintTicket } from "types/entities/MintTicket"
import { GenerativeToken } from "types/entities/GenerativeToken"
import { DisplayTezos } from "components/Display/DisplayTezos"
import { displayMutez } from "utils/units"
import { useMintingState } from "hooks/useMintingState"
import { useMintReserveInfo } from "hooks/useMintReserveInfo"
import { ReserveDropdown } from "components/GenerativeToken/ReserveDropdown"
import { Cover } from "components/Utils/Cover"
import { BaseButton, IconButton } from "components/FxParams/BaseInput"
import { TOnMintHandler } from "../MintWithTicketPage"
import style from "./PanelControls.module.scss"
import { ButtonPaymentCard } from "components/Utils/ButtonPaymentCard"
import {
  CreditCardCheckout,
  CreditCardCheckoutHandle,
} from "components/CreditCard/CreditCardCheckout"
import { useRouter } from "next/router"
import { useFetchRandomSeed } from "hooks/useFetchRandomSeed"

export type PanelSubmitMode = "with-ticket" | "free" | "live-minting" | "none"

export interface PanelControlsProps {
  token: GenerativeToken
  inputBytes: string | null
  onClickBack?: () => void
  onOpenNewTab?: () => void
  onSubmit: TOnMintHandler
  mode?: PanelSubmitMode
}

export function PanelControls(props: PanelControlsProps) {
  const {
    token,
    inputBytes,
    onClickBack,
    onOpenNewTab,
    onSubmit,
    mode = "none",
  } = props

  const router = useRouter()
  const { user } = useContext(UserContext)

  const [showDropdown, setShowDropdown] = useState(false)
  const { isMintDropdown, onMintShouldUseReserve, reserveConsumptionMethod } =
    useMintReserveInfo(token)

  const checkoutRef = useRef<CreditCardCheckoutHandle | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutOpHash, setCheckoutOpHash] = useState<string | null>(null)
  const { randomSeed: checkoutSeed } = useFetchRandomSeed(checkoutOpHash)

  const { enabled, locked, price, hidden } = useMintingState(token)
  const showMintButton = !hidden && !locked && enabled

  // get user mint tickets when user is available, and mode is "free"
  const { data } = useQuery(Qu_userMintTickets, {
    fetchPolicy: "network-only",
    variables: {
      id: user?.id,
    },
    skip: !(mode === "free" && user),
  })

  // extract user tickets for this project
  const userTickets = useMemo(() => {
    if (!data) return null
    if (!data.user?.mintTickets) return null
    const projectTickets = (data.user.mintTickets as MintTicket[])
      .filter((ticket) => ticket.token.id === token.id)
      .filter((ticket) =>
        isBefore(new Date(), new Date(ticket.taxationPaidUntil))
      )
      .sort((a, b) =>
        (a.taxationPaidUntil as any) < (b.taxationPaidUntil as any) ? 1 : -1
      )
    return projectTickets.length > 0 ? projectTickets : null
  }, [data, token.id])

  const handleClickMint = (useTicket: boolean) => () => {
    if (!useTicket && isMintDropdown) {
      setShowDropdown(true)
      return
    }
    onSubmit(null, onMintShouldUseReserve ? reserveConsumptionMethod : null)
  }

  const handleClickUseTicket = useCallback(() => {
    if (userTickets) {
      onSubmit(userTickets.map((ticket) => ticket.id))
    }
  }, [onSubmit, userTickets])

  return (
    <div className={style.controlPanel}>
      <div className={style.buttonsWrapper}>
        {onClickBack && (
          <IconButton onClick={onClickBack} title="go back to project page">
            <FontAwesomeIcon icon={faArrowLeft} />
          </IconButton>
        )}
        {onOpenNewTab && (
          <IconButton
            onClick={onOpenNewTab}
            title="open this variant into a new tab"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </IconButton>
        )}

        {mode === "with-ticket" && (
          <BaseButton
            color="main"
            onClick={handleClickMint(true)}
            className={style.submitButton}
            title={"use ticket"}
          >
            use ticket <i className="fa-sharp fa-solid fa-ticket" aria-hidden />
          </BaseButton>
        )}

        {mode === "free" && (
          <div className={style.submitButtons}>
            <div style={{ position: "relative", display: "flex" }}>
              {showMintButton && (
                <BaseButton
                  color="main"
                  onClick={handleClickMint(false)}
                  className={style.submitButton}
                  title={`mint with ${displayMutez(price)} tezos`}
                >
                  mint <DisplayTezos mutez={price} formatBig={false} />
                  {isMintDropdown && (
                    <i
                      aria-hidden
                      className={cs(`fas fa-caret-down`, style.caret)}
                      style={{
                        transform: showDropdown ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
                </BaseButton>
              )}
              {showDropdown && (
                <ReserveDropdown
                  className={style.reserveDropdown}
                  hideDropdown={() => setShowDropdown(false)}
                  onMint={(reserve) => onSubmit(null, reserve)}
                  reserveConsumptionMethod={reserveConsumptionMethod}
                  placement="top"
                />
              )}
            </div>
            {userTickets && (
              <BaseButton
                color="main"
                onClick={handleClickUseTicket}
                className={style.submitButton}
                title="exchange your ticket for an iteration"
              >
                use ticket{" "}
                <i className="fa-sharp fa-solid fa-ticket" aria-hidden />
              </BaseButton>
            )}
          </div>
        )}

        {mode === "live-minting" && (
          <>
            <ButtonPaymentCard
              className={style.creditCardButton}
              label={checkoutLoading ? "loading..." : "pay with card"}
              disabled={false}
              onClick={() => {
                setCheckoutLoading(true)
                checkoutRef.current?.open()
              }}
            />

            {typeof window !== "undefined" &&
              ReactDOM.createPortal(
                <CreditCardCheckout
                  ref={checkoutRef}
                  tokenId={token.id}
                  userId={user?.id!}
                  onClose={() => {
                    setCheckoutLoading(false)
                    setCheckoutOpHash(null)
                  }}
                  onSuccess={(hash: string) => {
                    setCheckoutOpHash(hash)
                  }}
                  onFinish={() => {
                    setCheckoutLoading(false)

                    if (mode === "live-minting") {
                      const {
                        id: eventId,
                        token: mintPassToken,
                        mode,
                      } = router.query
                      router.push(
                        `/live-minting/${eventId}/reveal/${
                          token.id
                        }/${checkoutSeed}?${new URLSearchParams({
                          token: mintPassToken as string,
                          fxparams: inputBytes!,
                          ...(mode && { mode: mode as string }),
                        })}`
                      )
                      return
                    }

                    router.push(
                      `/reveal/${token.id}?fxhash=${checkoutSeed}&fxparams=${inputBytes}&fxminter=${user?.id}`
                    )
                  }}
                  mintParams={{
                    create_ticket: null,
                    input_bytes: inputBytes || "",
                    referrer: null,
                  }}
                  consumeReserve={reserveConsumptionMethod}
                />,
                document.body
              )}
          </>
        )}

        {showDropdown && (
          <Cover
            index={100}
            onClick={() => setShowDropdown(false)}
            opacity={0}
          />
        )}
      </div>
    </div>
  )
}
