import style from "./EditStyle.module.scss"
import layout from "../../../styles/Layout.module.scss"
import text from "../../../styles/Text.module.css"
import cs from "classnames"
import * as Yup from "yup"
import { GenerativeToken, GenTokPricing } from "../../../types/entities/GenerativeToken"
import { Formik } from "formik"
import { Form } from "../../../components/Form/Form"
import { Fieldset } from "../../../components/Form/Fieldset"
import { Spacing } from "../../../components/Layout/Spacing"
import { Button } from "../../../components/Button"
import { useContractOperation } from "../../../hooks/useContractOperation"
import { ContractFeedback } from "../../../components/Feedback/ContractFeedback"
import { UpdatePricingOperation } from "../../../services/contract-operations/UpdatePricing"
import { YupPricingDutchAuction, YupPricingFixed } from "../../../utils/yup/price"
import { useMemo } from "react"
import { IReserve } from "../../../types/entities/Reserve"
import { transformReserveGenericToInput } from "../../../utils/transformers/reserves"
import { LinkIcon } from "../../../components/Link/LinkIcon"
import { InputReserves } from "../../../components/Input/Reserves/InputReserves"
import { YupReserves } from "../../../utils/yup/reserves"
import { UpdateReservesOperation } from "../../../services/contract-operations/UpdateReserve"


interface Props {
  token: GenerativeToken
}
export function EditReserves({
  token,
}: Props) {
  // the data in the reserves is not form-ready, so we need to transform it
  const reserveForm = useMemo<IReserve<string>[]>(() => {
    return transformReserveGenericToInput(token.reserves)
  }, [token])

  // we must define the validation because there's a dynamic value
  const validation = useMemo(() => Yup.object({
    reserves: YupReserves(() => token.originalSupply),
  }), [])

  const {
    call,
    loading,
    error,
    success,
    state,
  } = useContractOperation(UpdateReservesOperation)

  const update = (values: any) => {
    call({
      reserves: values.reserves,
      token: token,
    })
  }

  const disabled = token.balance === 0
  
  return (
    <Formik
      initialValues={{
        reserves: reserveForm
      }}
      onSubmit={update}
      validationSchema={validation}
    >
      {({ 
        values,
        setFieldValue,
        handleSubmit,
        handleChange,
        handleBlur,
        errors,
      }) => (
        <Form
          onSubmit={handleSubmit}
        >
          <Fieldset
            className={cs({
              [style.disabled]: disabled
            })}
            error={typeof errors.reserves === "string" 
              ? errors.reserves
              : undefined
            }
          >
            <h4>Reserves</h4>
            <Spacing size="large"/>

            {disabled && (
              <>
                <span className={cs(style.disabled_message)}>
                  You cannot update the reserves once the token is fully minted.
                </span>
                <Spacing size="large"/>
              </>
            )}

            <span className={cs(text.info)}>
              You can reserve a certain amount of editions using different constraints.<br/>
              We recommend{" "}
              <LinkIcon
                iconComp={
                  <i aria-hidden className="fas fa-external-link-square"/>
                }
                href="/doc/artist/reserves"
                iconSide="right"
                newTab
              >
                reading how to update the reserves properly
              </LinkIcon>
            </span>

            <Spacing size="regular"/>

            <InputReserves
              maxSize={token.originalSupply}
              value={values.reserves}
              onChange={reserves => setFieldValue("reserves", reserves)}
              errors={errors.reserves as any}
            />

            <Spacing size="3x-large"/>
            
            <div className={cs(layout.y_centered)}>
              <ContractFeedback
                state={state}
                loading={loading}
                success={success}
                error={error}
              />
              <Button
                type="submit"
                color="secondary"
                size="regular"
                state={loading ? "loading" : "default"}
                disabled={Object.keys(errors).length > 0}
              >
                edit reserves
              </Button>
            </div>
          </Fieldset>
        </Form>
      )}
    </Formik>
  )
}