import { useRouter } from "next/router"
import { useEffect, useState, useContext, useRef } from "react"
import { UserContext } from "./UserProvider"
import { Formik } from "formik"
import * as Yup from "yup"
import { Form } from "../components/Form/Form"
import { Field } from "../components/Form/Field"
import { Button } from "../components/Button"
import { InputText } from "../components/Input/InputText"
import style from "./EditProfile.module.scss"
import cs from "classnames"
import { InputTextarea } from "../components/Input/InputTextarea"
import { AvatarUpload } from "../components/User/AvatarUpload"
import { Spacing } from "../components/Layout/Spacing"
import { CachePolicies, useFetch } from "use-http"
import { ProfileUploadError, ProfileUploadResponse } from "../types/Responses"
import useAsyncEffect from "use-async-effect"


const Schema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Min 3 characters')
    .max(16, 'Max 16 characters')
    .required('Min 3 characters'),
  description: Yup.string()
    .max(250, 'Max 250 characters')
})

export function EditProfile() {
  const userCtx = useContext(UserContext)
  const user = userCtx.user!

  // hack Formik
  const userName = useRef<string>(user.name || "")

  const { post, loading, error, data: fetchData } = 
    useFetch<ProfileUploadResponse|ProfileUploadError>(`${process.env.NEXT_PUBLIC_API_FILE_ROOT}/profile`, {
      cachePolicy: CachePolicies.NO_CACHE
    })
  
  // this variable ensures that we can safely access its data regardless of the state of the queries
  const safeData: ProfileUploadResponse|false|undefined = !error && !loading && (fetchData as ProfileUploadResponse)

  // comment je voudrais l'utiliser ?
  

  useAsyncEffect(async () => {
    if (safeData && userCtx.walletManager) {
      userCtx.walletManager.updateProfile({
        name: userName.current,
        metadata: safeData.metadataUri
      }, (status) => {
        console.log(status)
      })
    }
  }, [safeData])

  const [avatarFile, setAvatarFile] = useState<File|null>(null)
  const [data, setData] = useState({
    name: user.name||"",
    description: user.description||""
  })

  useEffect(() => {
    setData({
      name: user.name||"",
      description: user.description||""
    })
    userName.current = user.name || ""
  }, [user])

  return (
    <>
      <Formik
        initialValues={data}
        enableReinitialize
        validationSchema={Schema}
        onSubmit={(values) => {
          const f = new FormData()
          if (avatarFile) {
            f.append('avatarFile', avatarFile)
          }
          else if (user.avatarUri) {
            f.append('avatarIpfs', user.avatarUri)
          }
          f.append('description', values.description)
          userName.current = values.name
          post(f)
        }}
      >
        {({ values, handleChange, handleBlur, handleSubmit, errors }) => (
          <Form className={cs(style.form)} onSubmit={handleSubmit}>
            <div className={cs(style['form-header'])}>
              <AvatarUpload
                currentIpfs={user.avatarUri}
                file={avatarFile}
                onChange={setAvatarFile}
                className={cs(style.avatar)}
              />

              <div className={cs(style.fields)}>
                <Field error={errors.name}>
                  <label htmlFor="name">Name</label>
                  <InputText
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.name}
                    className={cs(style.input)}
                  />
                </Field>

                <Field error={errors.description}>
                  <label htmlFor="description">Description</label>
                  <InputTextarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!errors.description}
                    className={cs(style.input)}
                  />
                </Field>
              </div>
            </div>

            <Spacing size="3x-large"/>

            <Button 
              type="submit"
              disabled={loading}
              state={loading ? "loading" : "default"}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>

      <Spacing size="3x-large"/>
      <Spacing size="3x-large"/>
      <Spacing size="3x-large"/>
    </>
  )
}