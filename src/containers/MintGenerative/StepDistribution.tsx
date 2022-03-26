import style from "./StepDistribution.module.scss"
import layout from "../../styles/Layout.module.scss"
import colors from "../../styles/Colors.module.css"
import text from "../../styles/Text.module.css"
import cs from "classnames"
import { StepComponent } from "../../types/Steps"
import { useContext, useEffect, useMemo, useState } from "react"
import { Formik } from "formik"
import * as Yup from "yup"
import useFetch, { CachePolicies } from "use-http"
import { MetadataError, MetadataResponse } from "../../types/Responses"
import { CaptureSettings, GenerativeTokenMetadata } from "../../types/Metadata"
import { CaptureMode, CaptureTriggerMode, GenTokDistributionForm, GenTokenInformationsForm } from "../../types/Mint"
import { Form } from "../../components/Form/Form"
import { Field } from "../../components/Form/Field"
import { InputText } from "../../components/Input/InputText"
import { Spacing } from "../../components/Layout/Spacing"
import { InputTextarea } from "../../components/Input/InputTextarea"
import { Fieldset } from "../../components/Form/Fieldset"
import { Checkbox } from "../../components/Input/Checkbox"
import { Button } from "../../components/Button"
import { InputTextUnit } from "../../components/Input/InputTextUnit"
import { getIpfsSlash } from "../../utils/ipfs"
import { UserContext } from "../UserProvider"
import { useContractCall } from "../../utils/hookts"
import { MintGenerativeCallData } from "../../types/ContractCalls"
import { ContractFeedback } from "../../components/Feedback/ContractFeedback"
import { getMutezDecimalsNb, isPositive } from "../../utils/math"
import { tagsFromString } from "../../utils/strings"
import { stringToByteString } from "../../utils/convert"
import { Collaboration, User, UserType } from "../../types/entities/User"
import { ISplit } from "../../types/entities/Split"
import { InputSplits } from "../../components/Input/InputSplits"
import { transformSplitsSum1000 } from "../../utils/transformers/splits"
import { InputPricing } from "../Input/Pricing"
import { GenTokPricing } from "../../types/entities/GenerativeToken"
import { addHours, isAfter } from "date-fns"
import { YupPrice, YupPricingDutchAuction, YupPricingFixed } from "../../utils/yup/price"
import { YupRoyalties } from "../../utils/yup/royalties"
import { cloneDeep } from "@apollo/client/utilities"
import { YupSplits } from "../../utils/yup/splits"


const validation = Yup.object().shape({
  editions: Yup.number()
    .typeError("Valid number plz")
    .min(1, "At least 1 edition")
    .max(10000, "10000 editions max.")
    .required("Required"),
  pricing: Yup.object({
    pricingFixed: Yup.object()
      .when("pricingMethod", {
        is: GenTokPricing.FIXED,
        then: YupPricingFixed,
      }),
    pricingDutchAuction: Yup.object()
      .when("pricingMethod", {
        is: GenTokPricing.DUTCH_AUCTION,
        then: YupPricingDutchAuction,
      })
  }),
  royalties: YupRoyalties,
  splitsPrimary: YupSplits,
  splitsSecondary: YupSplits,
})

const defaultDistribution = (user: User|Collaboration): GenTokDistributionForm => {
  let splits: ISplit[] = []

  // if user is single, we create a simple split
  if (user.type === UserType.REGULAR) {
    splits = [{
      address: user.id,
      pct: 1000,
    }]
  }
  // but if it's a collab
  else if ((user as Collaboration).collaborators) {
    const collab = user as Collaboration
    splits = collab.collaborators.map((user, idx) => ({
      address: user.id,
      pct: transformSplitsSum1000(collab.collaborators.length, idx)
    }))
  }

  return {
    pricing: {
      pricingMethod: GenTokPricing.FIXED,
      pricingFixed: {},
      pricingDutchAuction: {
        decrementDuration: 10,
        levels: [
          50,
          30,
          20,
          10,
          5
        ],
      }
    },
    enabled: false,
    splitsPrimary: cloneDeep(splits),
    splitsSecondary: cloneDeep(splits)
  }
}

export const StepDistribution: StepComponent = ({ state, onNext }) => {
  const userCtx = useContext(UserContext)
  const user = userCtx.user! as User

  console.log(user)

  console.log(state)

  // the object built at this step
  const distribution = useMemo<GenTokDistributionForm>(
    () => state.distribution ?? defaultDistribution(state.collaboration ?? user)
  , [])

  console.log(distribution)

  const update = (key: keyof GenTokDistributionForm, value: any) => {
    // setDistribution({
    //   ...distribution,
    //   [key]: value,
    // })
  }

  const uploadInformations = (formInformations: GenTokenInformationsForm) => {
    
  }

  return (
    <div className={cs(style.container)}>
      <h5>How will your piece be sold</h5>

      <Spacing size="3x-large"/>

      <Formik
        initialValues={distribution}
        validationSchema={validation}
        onSubmit={(values) => {
          // uploadInformations(values as GenTokenInformationsForm)
        }}
      >
        {({ values, handleChange, setFieldValue, handleBlur, handleSubmit, errors }) => (
          <Form 
            className={cs(layout.smallform, style.form)} 
            onSubmit={handleSubmit}
          >
            
            <em className={cs(colors.gray)}>
              You will be able to edit these settings after the publication, except if stated otherwise on the corresponding fields.
            </em>

            <Spacing size="3x-large"/>

            <Field error={errors.editions}>
              <label htmlFor="editions">
                Number of editions
                <small>how many NFT can be generated using your Token - <strong>can only be decreased after publication</strong></small>
              </label>
              <InputText
                type="text"
                name="editions"
                value={values.editions}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.editions}
              />
            </Field>

            <Field>
              <InputPricing
                value={values.pricing}
                onChange={val => setFieldValue("pricing", val)}
                errors={errors.pricing}
              />
            </Field>

            <Field 
              error={typeof errors.splitsPrimary === "string"
                ? errors.splitsPrimary
                : undefined
              }
            >
              <label>
                Primary Splits
                <small>
                  You can split the proceeds on primary between different addresses
                </small>
              </label>
              <InputSplits
                value={values.splitsPrimary}
                onChange={splits => setFieldValue("splitsPrimary", splits)}
                sharesTransformer={transformSplitsSum1000}
                textShares="Shares (out of 1000)"
                errors={errors.splitsPrimary as any}
              />
            </Field>

            <Field error={errors.royalties}>
              <label htmlFor="royalties">
                Royalties
                <small>in %, between 10 and 25</small>
              </label>
              <InputTextUnit
                unit="%"
                type="text"
                name="royalties"
                value={values.royalties||""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.royalties}
              />
            </Field>

            <Field
              error={typeof errors.splitsSecondary === "string" 
                ? errors.splitsSecondary
                : undefined
              }
            >
              <label>
                Royalties Splits
                <small>
                  You can also split the proceeds on the secondary (royalties will be divided between the addresses)
                </small>
              </label>
              <InputSplits
                value={values.splitsSecondary}
                onChange={splits => setFieldValue("splitsSecondary", splits)}
                sharesTransformer={transformSplitsSum1000}
                textShares="Shares (out of 1000)"
                errors={errors.splitsSecondary as any}
              />
            </Field>

            <Spacing size="3x-large"/>

            <em className={cs(text.info)} style={{ alignSelf: "flex-start"}}>
              If disabled, collectors cannot mint the token at all. It overrides pricing settings.<br/>
              You will have to enable it manually afterwards.
            </em>
            <Spacing size="small"/>
            <Field className={cs(style.checkbox)}>
              <Checkbox
                name="enabled"
                value={values.enabled!}
                onChange={(_, event) => handleChange(event)}
              >
                Enabled
              </Checkbox>
            </Field>

            <Spacing size="3x-large"/>

            <Button
              type="submit"
              color="secondary"
              size="large"
              disabled={Object.keys(errors).length > 0}
            >
              next step
            </Button>
          </Form>
        )}
      </Formik>

      <Spacing size="3x-large"/>
      <Spacing size="3x-large"/>
      <Spacing size="3x-large"/>
    </div>
  )
}