import style from "./ExploreTabs.module.scss"
import { PropsWithChildren } from "react"
import Link from "next/link"
import { TabDefinition, Tabs } from "../../components/Layout/Tabs"
import cs from "classnames"
import layout from "../../styles/Layout.module.scss"

const definition: TabDefinition[] = [
  { name: "gallery", props: { href: "/explore" } },
  { name: "incoming", props: { href: "/explore/incoming" } },
  { name: "reveal feed", props: { href: "/explore/reveal-feed" } },
]

interface TabProps {
  href: string
  className: string
}
export function ExploreTab({
  href,
  className,
  children,
}: PropsWithChildren<TabProps>) {
  return (
    <Link href={href} scroll={false}>
      <a className={className}>{children}</a>
    </Link>
  )
}

interface Props {
  active: number
}
export function ExploreTabs({ active }: Props) {
  return (
    <div className={cs(layout["padding-big"])}>
      <Tabs
        tabDefinitions={definition}
        activeIdx={active}
        tabsLayout="fixed-size-narrow"
        tabWrapperComponent={ExploreTab}
      />
    </div>
  )
}
