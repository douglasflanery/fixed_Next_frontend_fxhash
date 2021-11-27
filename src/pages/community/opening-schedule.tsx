import cs from "classnames"
import layout from "../../styles/Layout.module.scss"
import style from "./Reports.module.scss"
import { NextPage } from "next"
import Link from "next/link"
import { SectionHeader } from "../../components/Layout/SectionHeader"
import { TitleHyphen } from "../../components/Layout/TitleHyphen"
import { Spacing } from "../../components/Layout/Spacing"
import Head from "next/head"
import { useMemo, useState } from "react"
import { ClientOnlyEmpty } from "../../components/Utils/ClientOnly"
import { ContractsOpened } from "../../components/Utils/ContractsOpened"
import { addHours, formatRFC7231 } from "date-fns"
import { Schedule } from "../../containers/Community/Schedule"
import { getLocalTimezone, Timezone, timezones, timezoneSearchKeys } from "../../utils/timzones"
import { IOptions, Select } from "../../components/Input/Select"
import { Field } from "../../components/Form/Field"


const optionsTimezones: IOptions[] = timezones.map(timezone => ({
  label: timezone.text,
  value: timezone.value
}))

const SchedulePage: NextPage = () => {
  // compute the next contract opening
  const nextOpening = useMemo<Date>(() => {
    const reference = new Date(process.env.NEXT_PUBLIC_REFERENCE_OPENING!)
    const next = addHours(reference, 23)
    return next
  }, [])

  const nextClosing = useMemo<Date>(() => {
    const reference = new Date(process.env.NEXT_PUBLIC_REFERENCE_OPENING!)
    const next = addHours(reference, 23+12)
    return next
  }, [])

  const [timezone, setTimezone] = useState<Timezone>(getLocalTimezone())
  const updateTimezone = (value: string) => setTimezone(timezones.find(tz => tz.value === value)!)

  return (
    <>
      <Head>
        <title>fxhash — opening schedule</title>
        <meta key="og:title" property="og:title" content="fxhash — opening schedule"/> 
        <meta key="description" name="description" content="The opening schedule of fxhash"/>
        <meta key="og:description" property="og:description" content="The opening schedule of fxhash"/>
        <meta key="og:type" property="og:type" content="website"/>
        <meta key="og:image" property="og:image" content="https://www.fxhash.xyz/images/og/og1.jpg"/>
      </Head>

      <Spacing size="6x-large" />

      <section>
        <SectionHeader>
          <TitleHyphen>opening schedule</TitleHyphen>
        </SectionHeader>

        <Spacing size="3x-large" />

        <main className={cs(layout['padding-big'])}>
          <p>The contracts of fxhash are following an opening schedule.</p>
          <p>If the contracts are closed, you will not be able possible to publish a Generative Token not mint unique iterations. The marketplace stays open all the time.</p>
          <p>The indicator on the top-right [🔴/🟢] reflects the current state of the contract.</p>

          <Spacing size="3x-large" />

          <ClientOnlyEmpty>
            <h4>Current state</h4>
            <Spacing size="small"/>
            <ContractsOpened/>
          </ClientOnlyEmpty>

          <Spacing size="3x-large" />

          <h4>Next cycle</h4>
          <Spacing size="small"/>
          <ul>
            <li><strong>Opening:</strong> {formatRFC7231(nextOpening)}</li>
            <li><strong>Closing:</strong> {formatRFC7231(nextClosing)}</li>
          </ul>
          <Spacing size="3x-large" />

          <h4>Planning</h4>
          <Spacing size="small"/>
          <Field>
            <label>Timezone</label>
            <Select
              value={timezone.value}
              options={optionsTimezones}
              onChange={updateTimezone}
              search={true}
              searchKeys={timezoneSearchKeys}
              searchDictionnary={timezones}
              searchValue="value"
            />
          </Field>
          <Spacing size="large"/>
          <ClientOnlyEmpty>
            <Schedule
              timezone={timezone}
            />
          </ClientOnlyEmpty>

          <Spacing size="6x-large" />
        </main>
      </section>
    </>
  )
}

export default SchedulePage