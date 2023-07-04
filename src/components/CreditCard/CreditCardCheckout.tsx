import { forwardRef, useImperativeHandle, useState } from "react"
import { winterCheckoutAppearance } from "utils/winter"
import WinterCheckout, { IWinterMintPass } from "./WinterCheckout"
import { IReserveConsumption } from "services/contract-operations/Mint"
import { prepareReserveConsumption } from "utils/pack/reserves"
import { EReserveMethod } from "types/entities/Reserve"

interface MintParams {
  create_ticket: string | null
  input_bytes: string
  referrer: string | null
  recipient?: string
}

export interface CreditCardCheckoutHandle {
  open: () => Promise<void>
}

interface CreditCardCheckoutProps {
  ref: React.Ref<CreditCardCheckoutHandle>
  tokenId: number
  userId: string
  onClose?: () => void
  onSuccess: (transactionHash: string, amountUSD: number) => void
  onFinish?: (data: any) => void
  mintParams: MintParams
  consumeReserve?: IReserveConsumption | null
}

export const CreditCardCheckout = forwardRef<
  CreditCardCheckoutHandle,
  CreditCardCheckoutProps
>(
  (
    {
      tokenId,
      userId,
      onClose,
      onSuccess,
      onFinish,
      mintParams,
      consumeReserve = null,
    },
    ref
  ) => {
    const [showModal, setShowModal] = useState(false)
    const [reserveInputCC, setReserveInputCC] = useState<string | null>(null)
    const [mintPassCC, setMintPassCC] = useState<IWinterMintPass | null>(null)

    /**
     * Close the modal and reset the state
     */
    const closeModal = () => {
      setReserveInputCC(null)
      setMintPassCC(null)
      setShowModal(false)
    }

    /**
     * Prepare the reserve consumption if needed
     */
    const prepare = async () => {
      if (!consumeReserve) return
      if (consumeReserve.method !== EReserveMethod.MINT_PASS)
        throw new Error(
          "only mint pass reserve consumption is supported for credit card checkout"
        )

      try {
        const { reserveInput, payloadPacked, payloadSignature } =
          await prepareReserveConsumption(consumeReserve)

        const isMintPass = payloadPacked && payloadSignature
        if (isMintPass)
          setMintPassCC({
            address: consumeReserve.data.reserveData,
            parameters: {
              payload: payloadPacked,
              signature: payloadSignature,
            },
          })
        setReserveInputCC(reserveInput)
      } catch (err) {
        console.log(err)
        return
      }
    }

    useImperativeHandle(ref, () => ({
      open: async () => {
        await prepare()
        setShowModal(true)
      },
    }))

    return (
      <WinterCheckout
        showModal={showModal}
        production={process.env.NEXT_PUBLIC_TZ_NET === "mainnet"}
        projectId={8044}
        gentkId={tokenId}
        walletAddress={userId}
        onClose={() => {
          onClose?.()
          closeModal()
        }}
        onSuccess={onSuccess}
        onFinish={(data) => {
          onFinish?.(data)
          closeModal()
        }}
        appearance={winterCheckoutAppearance}
        additionalPurchaseParams={{
          mintPass: mintPassCC,
          reserve_input: reserveInputCC,
          ...mintParams,
        }}
      />
    )
  }
)
CreditCardCheckout.displayName = "CreditCardCheckout"
