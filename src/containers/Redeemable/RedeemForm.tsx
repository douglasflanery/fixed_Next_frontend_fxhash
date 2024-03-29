import text from "styles/Text.module.css"
import cs from "classnames"
import { RedeemableDetails } from "types/entities/Redeemable"
import { Form, Formik } from "formik"
import { FormRedeemableOptions } from "components/Form/Redeemable/Options"
import React, { useMemo, useState } from "react"
import { array, number, object, SchemaOf } from "yup"
import { Submit } from "components/Form/Submit"
import { Button } from "components/Button"
import { Divider } from "components/UI/Divider"
import { Spacing } from "components/Layout/Spacing"
import { RedeemTotalCost } from "./RedeemTotalCost"
import { FormRedeemableUserActions } from "components/Form/Redeemable/UserActions"
import { redeemableUserActionDefinitions } from "definitions/Redeemable/UserActions"
import { RedeemModal } from "./RedeemModal"
import { Objkt } from "types/entities/Objkt"
import { Infobox } from "../../components/UI/Infobox"
import { LinkGuide } from "../../components/Link/LinkGuide"
import style from "./RedeemForm.module.scss"

export interface Inputs {
  options: (number | null)[]
  inputs: Record<string, any>
}

function generateValidationSchema(
  redeemable: RedeemableDetails
): SchemaOf<Inputs> {
  const optionsSchema: SchemaOf<(number | null)[]> = array()
    .of(number().typeError("Required!").required("Required!"))
    .min(redeemable.options.length)
    .max(redeemable.options.length)

  // build the validation schema from required properties and the validation of
  // these properties in the definition object
  const inputsSchema = object().shape(
    Object.fromEntries(
      redeemable.publicDefinition?.userActions?.map((action) => [
        action.id,
        redeemableUserActionDefinitions[action.type].validation,
      ])
    )
  )

  return object().shape({
    options: optionsSchema,
    inputs: inputsSchema,
  })
}

interface Props {
  gentk: Objkt
  redeemable: RedeemableDetails
}
export function RedeemForm({ redeemable, gentk }: Props) {
  // is the redeem modal opened ? at the end of entering inputs
  const [inputs, setInputs] = useState<Inputs | null>(null)
  const [modalOpened, setModalOpened] = useState(false)

  const initialValues = useMemo<Inputs>(
    () => ({
      options: redeemable.options.map(() => null),
      inputs: Object.fromEntries(
        redeemable.publicDefinition?.userActions?.map((action) => [
          action.id,
          redeemableUserActionDefinitions[action.type].initialValue(),
        ])
      ),
    }),
    [redeemable]
  )

  const validation = useMemo(
    () => generateValidationSchema(redeemable),
    [redeemable]
  )

  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          setInputs(values)
          setModalOpened(true)
        }}
        validationSchema={validation}
      >
        {({ isSubmitting, isValid, values, errors, setFieldValue }) => (
          <Form>
            <FormRedeemableOptions
              id="options"
              options={redeemable.options}
              errors={errors.options}
            />

            {redeemable.publicDefinition?.userActions?.length > 0 && (
              <FormRedeemableUserActions
                id="inputs"
                userActions={redeemable.publicDefinition.userActions}
              />
            )}

            <Spacing size="x-large" />
            <Divider color="gray-vvlight" />
            <Spacing size="x-large" />

            <span className={cs(text.info)}>
              Your data will be kept securely on our servers and will not be
              shared with anyone outside of the fxhash organisation. As soon as
              the order is fully proceeded, we will delete your data
              permanently.
            </span>

            <Spacing size="x-large" />
            <Divider color="gray-vvlight" />
            <Spacing size="regular" />

            <RedeemTotalCost
              redeemable={redeemable}
              selected={values.options}
            />
            <Spacing size="x-large" />
            <Infobox>
              This page lets you redeem your token to activate its effect.
              <br />
              <strong>You will keep the ownership of your token.</strong>
              <br />
              <br />
              <LinkGuide href="/doc">
                Read more about redeemable tokens
              </LinkGuide>
            </Infobox>
            <Submit layout="center">
              <Button
                type="submit"
                className={style.button}
                color="secondary"
                disabled={!isValid}
              >
                redeem token
              </Button>
            </Submit>
          </Form>
        )}
      </Formik>

      {modalOpened && inputs && (
        <RedeemModal
          title={`Redeem ${gentk.name}`}
          onClose={() => setModalOpened(false)}
          gentk={gentk}
          redeemable={redeemable}
          inputs={inputs}
        />
      )}
    </>
  )
}
