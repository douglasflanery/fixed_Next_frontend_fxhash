import style from "./EditStyle.module.scss"
import layout from "../../../styles/Layout.module.scss"
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
import { InputPricingFixed } from "../../Input/PricingFixed"
import { transformPricingDutchNumbersToString, transformPricingFixedNumbersToString } from "../../../utils/transformers/pricing"
import { InputPricingDutchAuction } from "../../Input/PricingDutchAuction"
import { UpdatePricingOperation } from "../../../services/contract-operations/UpdatePricing"
import { isAfter } from "date-fns"
import { YupPricingDutchAuction, YupPricingFixed } from "../../../utils/yup/price"


const validation = Yup.object({
  pricingFixed: YupPricingFixed.nullable(),
  pricingDutchAuction: YupPricingDutchAuction(0, "Must be after now")
    .nullable(),
})

interface Props {
  token: GenerativeToken
}
export function EditPricing({
  token,
}: Props) {

  const {
    call,
    loading,
    error,
    success,
    state,
  } = useContractOperation(UpdatePricingOperation)

  const update = (values: any) => {
    call({
      data: {
        pricingMethod: token.pricingDutchAuction 
          ? GenTokPricing.DUTCH_AUCTION
          : GenTokPricing.FIXED,
        pricingFixed: values.pricingFixed,
        pricingDutchAuction: values.pricingDutchAuction,
      },
      token: token,
    })
  }

  const disabled = token.balance === 0
    || (token.pricingDutchAuction && isAfter(
        new Date(), new Date(token.pricingDutchAuction.opensAt!)
      ))
  
  return (
    <Formik
      initialValues={{
        pricingFixed: token.pricingFixed ?
          transformPricingFixedNumbersToString(
            token.pricingFixed
          ):null,
        pricingDutchAuction: token.pricingDutchAuction ?
          transformPricingDutchNumbersToString(
            token.pricingDutchAuction
          ):null,
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
          >
            <h4>Pricing settings</h4>
            <Spacing size="large"/>

            {console.log(errors)}

            {disabled && (
              <>
                <span className={cs(style.disabled_message)}>
                  {token.balance === 0 
                    ? "You cannot update the pricing once minting is completed."
                    : "You cannot update a Dutch Auction settings after it has started"
                  }
                </span>
                <Spacing size="large"/>
              </>
            )}

            {values.pricingFixed && (
              <InputPricingFixed
                value={values.pricingFixed}
                onChange={v => setFieldValue("pricingFixed", v)}
                errors={errors?.pricingFixed as any}
              />
            )}

            {values.pricingDutchAuction && (
              <InputPricingDutchAuction
                value={values.pricingDutchAuction}
                onChange={v => setFieldValue("pricingDutchAuction", v)}
                errors={errors?.pricingDutchAuction as any}
              />
            )}

            <Spacing size="3x-large"/>
            
            <div className={cs(layout.y_centered)}>
              <ContractFeedback
                state={state}
                loading={loading}
                success={success}
                error={error}
                successMessage="Your project settings were updated"
              />
              <Button
                type="submit"
                color="secondary"
                size="regular"
                state={loading ? "loading" : "default"}
                disabled={Object.keys(errors).length > 0}
              >
                edit pricing
              </Button>
            </div>
          </Fieldset>
        </Form>
      )}
    </Formik>
  )
}