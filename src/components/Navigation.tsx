import Link from 'next/link'
import style from './Navigation.module.scss'
import text from '../styles/Text.module.css'
import effects from '../styles/Effects.module.scss'
import cs from 'classnames'
import { Button } from './Button'
import { useContext } from 'react'
import { UserContext } from '../containers/UserProvider'
import { Dropdown } from './Navigation/Dropdown'
import { Avatar } from './User/Avatar'
import { getUserProfileLink } from '../utils/user'

export function Navigation() {
  const userCtx = useContext(UserContext)

  console.log(userCtx)

  return (
    <nav className={cs(style.nav, text.h6)}>
      <Link href="/explore">
        <a>explore</a>
      </Link>
      <Link href="/marketplace">
        <a>marketplace</a>
      </Link>
      <Link href="/sandbox">
        <a>sandbox</a>
      </Link>

      <Dropdown
        itemComp={<span>about</span>}
      >
        <Link href="/about">
          <a>about fxhash</a>
        </Link>
        <Link href="/guide">
          <a>guide to mint Generative Token</a>
        </Link>
      </Dropdown>

      {userCtx.user ? (
        <Dropdown
          itemComp={<Avatar uri={userCtx.user.avatarUri} className={cs(style.avatar, effects['drop-shadow-big'])} />}
        >
          <Link href="/mint-generative">
            <a>mint generative token</a>
          </Link>
          <Link href={`${getUserProfileLink(userCtx.user)}`}>
            <a>creations</a>
          </Link>
          <Link href={`${getUserProfileLink(userCtx.user)}/collection`}>
            <a>collection</a>
          </Link>
          <Link href="/edit-profile">
            <a>edit profile</a>
          </Link>
          <Button 
            size="small" 
            color="primary" 
            onClick={() => userCtx.disconnect()}
            style={{
              marginTop: "5px"
            }}
          >
            unsync
          </Button>
        </Dropdown>
      ):(
        <Button
          className="btn-sync"
          iconComp={<i aria-hidden className="fas fa-wallet"/>}
          onClick={() => {
            userCtx.connect()
          }}
        >
          sync
        </Button>
      )}
    </nav>
  )
}