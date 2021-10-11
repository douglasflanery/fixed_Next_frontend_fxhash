import style from "./Footer.module.scss"
import cs from "classnames"
import Link from "next/link"


interface SocialProps {
  icon: string
  url: string
}

function FooterSocial({ icon, url }: SocialProps) {
  return (
    <Link href={url}>
      <a><i className={`fab fa-${icon}`}/></a>
    </Link>
  )
}

export function Footer() {
  return (
    <footer className={cs(style.footer)}>
      <div className={cs(style.content)}>
        <h1>art is evolving</h1>
        <div className={cs(style.details)}>
          <span>and we were born to witness it</span>
          <div className={cs(style.socials)}>
            <FooterSocial icon="twitter" url={process.env.NEXT_PUBLIC_URL_TWITTER!} />
            <FooterSocial icon="instagram" url={process.env.NEXT_PUBLIC_URL_INSTAGRAM!} />
            <FooterSocial icon="discord" url={process.env.NEXT_PUBLIC_URL_DISCORD!} />
          </div>
        </div>
      </div>
      <div className={cs(style.powered)}>
        powered by <a href="https://tzkt.io/">TzTK API</a> &amp; <a href="https://smartpy.io/">SmartPy</a>
      </div>
    </footer>
  )
}