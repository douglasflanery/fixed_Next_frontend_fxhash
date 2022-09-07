import React, { memo, useCallback, useContext } from 'react';
import style from "./HeaderMinimalist.module.scss";
import { Logo } from "../Logo/Logo";
import { Button } from "../Button";
import { Dropdown } from "../Navigation/Dropdown";
import { UserContext } from "../../containers/UserProvider";
import { UserBadge } from "../User/UserBadge";
import { User } from "../../types/entities/User";
import { UserFromAddress } from "../User/UserFromAddress";

const _HeaderMinimalist = () => {
  const userCtx = useContext(UserContext);
  const handleDisconnect = useCallback(() => userCtx.disconnect(), [userCtx])
  return (
    <header className={style.header}>
      <div className={style.logo}>
        <Logo height={34} width={107} fontSize={20} />
        <span>fx(hash)</span>
      </div>
      {userCtx.user &&
        <Dropdown
          mobileMenuAbsolute
          ariaLabel="Open user actions"
          itemComp={userCtx.user.avatarUri ? (
            <UserBadge
              user={userCtx.user as User}
              hasLink={false}
              avatarSide="right"
            />) : (
              <UserFromAddress address={userCtx.user.id}>
                {({ user: fetchedUser }) =>
                  <UserBadge
                    user={fetchedUser}
                    hasLink={false}
                    avatarSide="right"
                  />
                }
              </UserFromAddress>
            )
          }
        >
          <Button
            size="small"
            color="primary"
            onClick={handleDisconnect}
            className={style.button_disconnect}
          >
            unsync
          </Button>
        </Dropdown>
      }
    </header>
  );
};

export const HeaderMinimalist = memo(_HeaderMinimalist);
