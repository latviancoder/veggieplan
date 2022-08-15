import { useAuth0 } from '@auth0/auth0-react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

export const UserActions = () => {
  const { isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth0();

  return (
    <ButtonGroup
      vertical
      minimal
      style={{ visibility: isLoading ? 'hidden' : 'visible' }}
    >
      {!isAuthenticated && (
        <Tooltip2 content={<span>Einloggen</span>}>
          <Button
            icon="log-in"
            onClick={() =>
              loginWithRedirect({ ui_locales: 'de', screen_hint: 'signup' })
            }
          />
        </Tooltip2>
      )}
      {isAuthenticated && (
        <Tooltip2 content={<span>Ausloggen</span>}>
          <Button icon="user" onClick={() => logout()} />
        </Tooltip2>
      )}
    </ButtonGroup>
  );
};
