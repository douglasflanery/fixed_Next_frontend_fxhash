import style from "./CollabBadge.module.scss"
import colors from "../../styles/Colors.module.css"
import badgeStyle from "./UserBadge.module.scss"
import cs from "classnames"
import { IProps as IEntityBadgeProps } from "./EntityBadge"
import { Collaboration } from "../../types/entities/User"
import { Avatar } from "./Avatar"
import { useMemo, useState } from "react"
import { shuffleArray } from "../../utils/array"
import { UserBadge } from "./UserBadge"
import { isUserVerified } from "../../utils/user"

interface Props extends IEntityBadgeProps {
  user: Collaboration
}
export function CollabBadge(props: Props) {
  // extract from props
  const {
    user,
    size,
    toggeable = false,
    avatarSide,
  } = props

  const [opened, setOpened] = useState<boolean>(false)
  const users = useMemo(() => shuffleArray(user.collaborators), [user])

  return (
    <div className={cs(
      style.root, 
      style[`size_${size}`], 
      style[`side_${avatarSide}`], {
        [style.opened]: opened,
        [style.toggeable]: toggeable,
      }
    )}>
      <button
        type="button"
        className={cs(style.avatars)}
        onClick={() => setOpened(!opened)}
        disabled={!toggeable}
      >
        {users.map(user => (
          <div className={cs(style.avatar_wrapper)}>
            <Avatar
              key={user.id}
              uri={user.avatarUri}
              className={cs(
                badgeStyle.avatar,
                badgeStyle[`avatar-${size}`],
                style.avatar,
              )}
            />
            <span className={cs(style.user_name)}>
              <span className={cs(style.user_name_content)}>
                {user.name}
                {isUserVerified(user) && (
                  <i 
                    aria-hidden 
                    className={cs("fas", "fa-badge-check", style.verified)}
                  />
                )}
              </span>
            </span>
          </div>
        ))}
        <div 
          className={cs(
            badgeStyle.avatar,
            badgeStyle[`avatar-${size}`],
            style.avatar,
            style.avatar_wrapper,
            style.link,
          )}
        >
          <span>
            {toggeable ? (
              <>
                <i 
                  className={cs(
                    `fa-solid fa-angle-${opened?"up":"down"}`,
                    style.caret,
                  )}
                  aria-hidden
                />
                <span> collab </span>
              </>
            ):(
              <i className="fa-solid fa-link" aria-hidden/>
            )}
          </span>
        </div>
      </button>
  
      {toggeable && (
        <div className={cs(style.collaborators)}>
          {users.map(user => (
            <UserBadge
              key={user.id}
              {...props}
              user={user}
              size="regular"
              className={cs(style.collaborator)}
            />
          ))}
        </div>
      )}
    </div>
  )
}