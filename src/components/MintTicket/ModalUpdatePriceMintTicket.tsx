import React, { memo, useCallback } from "react"
import { Button } from "../Button"
import { MintTicket } from "../../types/entities/MintTicket"
import { DisplayTezos } from "../Display/DisplayTezos"
import { Modal } from "../Utils/Modal"
import style from "./MintTicketModal.module.scss"
import { InputTextUnit } from "../Input/InputTextUnit"
import { Spacing } from "../Layout/Spacing"
import { useFormik } from "formik"
import { useContractOperation } from "../../hooks/useContractOperation"
import {
  TicketUpdatePriceV3Operation,
  TTicketUpdatePriceV3OperationParams,
} from "../../services/contract-operations/TicketUpdatePriceV3"
import * as Yup from "yup"
import { YupPrice } from "../../utils/yup/price"
import { Error } from "../Error/Error"
import {
  differenceInDays,
  differenceInHours,
  differenceInSeconds,
  formatDuration,
  intervalToDuration,
  isBefore,
  set,
  subDays,
} from "date-fns"
import { YupDaysCoverage } from "../../utils/yup/ticket"
import cs from "classnames"
import {
  getDaysCoveredByHarbergerTax,
  getMintTicketHarbergerTax,
} from "../../utils/math"
import { ContractFeedback } from "../Feedback/ContractFeedback"

const getTicketLastDayConsumed = (createdAt: Date) => {
  const dateCreatedAt = new Date(createdAt)
  const now = new Date()
  const lastDayConsumed = set(now, {
    hours: dateCreatedAt.getHours(),
    minutes: dateCreatedAt.getMinutes(),
  })
  if (lastDayConsumed < now) return lastDayConsumed
  return subDays(lastDayConsumed, 1)
}

const getUpdatedPriceAmountToPayOrClaim = (
  mintTicket: MintTicket,
  newTzPrice: number,
  newCoverage: number
) => {
  const taxStart = new Date(mintTicket.taxationStart)
  const lastDayConsumed = getTicketLastDayConsumed(mintTicket.createdAt)
  const consumedTaxDays =
    lastDayConsumed < taxStart ? 0 : differenceInDays(taxStart, lastDayConsumed)
  const taxAlreadyPaid = getMintTicketHarbergerTax(
    mintTicket.price,
    consumedTaxDays
  )
  const amount = getMintTicketHarbergerTax(newTzPrice, newCoverage)
  const totalToPayOrClaim =
    amount - (parseInt(mintTicket.taxationLocked) - taxAlreadyPaid)
  return totalToPayOrClaim
}

const validation = Yup.object({
  price: YupPrice,
  days: YupDaysCoverage,
})

interface ModalUpdatePriceMintTicketProps {
  mintTicket: MintTicket
  onClose: () => void
}

const _ModalUpdatePriceMintTicket = ({
  mintTicket,
  onClose,
}: ModalUpdatePriceMintTicketProps) => {
  const { state, error, call, loading, success } =
    useContractOperation<TTicketUpdatePriceV3OperationParams>(
      TicketUpdatePriceV3Operation
    )
  const { handleChange, handleBlur, handleSubmit, values, errors } = useFormik({
    initialValues: {
      price: mintTicket.price / 1000000,
      days: 0,
    },
    onSubmit: (submittedValues) => {
      const tzPrice = submittedValues.price * 1000000
      const daysSinceCreated = Math.floor(
        differenceInSeconds(new Date(), new Date(mintTicket.createdAt)) / 86400
      )
      const remainingGracingPeriodInDays =
        mintTicket.settings.gracingPeriod - daysSinceCreated
      const amount = getUpdatedPriceAmountToPayOrClaim(
        mintTicket,
        tzPrice,
        submittedValues.days
      )
      call({
        ticketId: mintTicket.id,
        taxationSettings: {
          coverage: +submittedValues.days + remainingGracingPeriodInDays,
          price: tzPrice,
        },
        amount: amount < 0 ? 0 : amount,
      })
    },
    validationSchema: validation,
  })

  const handleFormatHours = useCallback(
    (hours: number) =>
      formatDuration(
        intervalToDuration({
          start: 0,
          end: hours * 3600000,
        }),
        { format: ["days", "hours"] }
      ),
    []
  )
  const nowDate = new Date()
  const taxStart = new Date(mintTicket.taxationStart)
  const remainingGracingPeriod = isBefore(nowDate, taxStart)
    ? differenceInHours(taxStart, nowDate)
    : 0
  const consumedTaxDaysInHours = isBefore(nowDate, taxStart)
    ? 0
    : differenceInHours(taxStart, nowDate)
  const daysCoveredInHours =
    getDaysCoveredByHarbergerTax(
      parseInt(mintTicket.taxationLocked),
      mintTicket.price
    ) * 24
  const remainingTaxCoverageInHours =
    daysCoveredInHours - consumedTaxDaysInHours
  const totalCoveredInHours =
    remainingGracingPeriod + remainingTaxCoverageInHours
  const formattedGracingPeriod = handleFormatHours(remainingGracingPeriod)
  const formattedRemainingTaxCoverage = handleFormatHours(
    remainingTaxCoverageInHours
  )
  const formattedTotal = handleFormatHours(totalCoveredInHours)
  const percentGracingPeriod =
    (remainingGracingPeriod * 100) / totalCoveredInHours
  const percentTaxCoverage =
    (remainingTaxCoverageInHours * 100) / totalCoveredInHours
  const styleGracingPeriod = {
    width: `${percentGracingPeriod}%`,
  }

  const newDaysCoveredInHours = (values.days || 0) * 24
  const newTotalCoveredInHours = remainingGracingPeriod + newDaysCoveredInHours
  const percentNewGracingPeriod =
    (remainingGracingPeriod * 100) / newTotalCoveredInHours
  const styleNewGracingPeriod = {
    width: `${percentNewGracingPeriod}%`,
  }

  const totalToPayOrClaim = getUpdatedPriceAmountToPayOrClaim(
    mintTicket,
    values.price * 1000000,
    values.days
  )
  const absTotalToPayOrClaim = {
    total: Math.abs(totalToPayOrClaim),
    type: totalToPayOrClaim < 0 ? "claim" : "cost",
  }
  return (
    <Modal
      title={`Update price for “${mintTicket.token?.name}”`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <p className={style.p}>
          Lorem ipsum dolor sit amet consectetur. Vulputate tristique malesuada
          auctor sit duis nunc vel. Viverra nibh felis massa montes tincidunt
          nisl tempus amet cursus. Eu vitae nulla est platea morbi molestie eu
          ut.
        </p>
        <div className={style.title}>with the current settings:</div>
        <div className={style.row_with_unit}>
          <div className={style.row_label}>
            You will keep ownership of your pass:
          </div>
          <div className={style.unit}>{formattedTotal}</div>
        </div>
        <Spacing size="small" />
        <div className={style.row_with_unit}>
          <div className={style.row_label}>
            Gracing period{" "}
            <span className={style.regular}>{formattedGracingPeriod}</span>
          </div>
          <div className={style.unit}>
            <span className={style.p}>Tax paid</span>{" "}
            <span>{formattedRemainingTaxCoverage || "0 day"}</span>
          </div>
        </div>
        <div className={style.progress_bar}>
          <div className={style.left} style={styleGracingPeriod} />
          <div className={style.right} />
        </div>
        <Spacing size="small" />
        <div className={cs(style.progress_bar, style.new)}>
          <div className={style.left} style={styleNewGracingPeriod} />
          <div className={style.right} />
        </div>
        <div className={style.row_with_unit}>
          <div className={style.row_label} />
          <div className={style.unit}>
            <span className={style.p}>End on</span> <span>xxx</span>
          </div>
        </div>
        <hr className={style.hr2} />
        <Spacing size="regular" />
        <div className={style.container_inputs}>
          <div className={style.field}>
            <div className={style.container_input}>
              <label htmlFor="price">
                <div className={style.label_title}>price</div>
                <div className={style.label_subtitle}>
                  Anyone paying this price can claim your pass at any time
                </div>
              </label>
              <InputTextUnit
                error={!!errors.price}
                name="price"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                classNameContainer={style.input}
                sizeX="small"
                unit="tez"
                id="price"
              />
            </div>
            {errors.price && (
              <Error className={style.error}>{errors.price}</Error>
            )}
          </div>
          <div className={style.field}>
            <div className={style.container_input}>
              <label htmlFor="days">
                <div className={style.label_title}>
                  days covered by your tax
                </div>
                <div className={style.label_subtitle}>
                  For how long do you want your token to be secured at this
                  price? Not including the gracing period.
                </div>
              </label>
              <InputTextUnit
                name="days"
                classNameContainer={style.input}
                value={values.days}
                onChange={handleChange}
                onBlur={handleBlur}
                sizeX="small"
                unit="days"
                id="days"
              />
            </div>
            {errors.days && (
              <Error className={style.error}>{errors.days}</Error>
            )}
          </div>{" "}
        </div>
        <hr className={style.hr} />
        <p className={style.p}>
          Based on these new settings, you will{" "}
          <strong>
            {absTotalToPayOrClaim.type === "claim"
              ? "claim back"
              : "have to pay"}
          </strong>{" "}
          <DisplayTezos
            mutez={absTotalToPayOrClaim.total}
            formatBig={false}
            tezosSize="regular"
          />{" "}
          tez
        </p>
        <div className={style.container_buttons}>
          <Button
            type="submit"
            size="small"
            state={loading ? "loading" : "default"}
          >
            update ({absTotalToPayOrClaim.type}:{" "}
            <DisplayTezos
              mutez={absTotalToPayOrClaim.total}
              formatBig={false}
              tezosSize="regular"
            />
            )
          </Button>
        </div>
        <div className={style.contract_feedback}>
          <ContractFeedback
            state={state}
            loading={loading}
            success={success}
            error={error}
          />
        </div>
      </form>
    </Modal>
  )
}

export const ModalUpdatePriceMintTicket = memo(_ModalUpdatePriceMintTicket)
