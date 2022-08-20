import { useAuth0 } from '@auth0/auth0-react';
import { Button, ButtonGroup } from '@blueprintjs/core';

export const UserActions = () => {
  const { isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth0();

  const redirectToLogin = () => {
    loginWithRedirect({
      ui_locales: 'de',
    });
  };

  return (
    <ButtonGroup
      vertical
      minimal
      style={{ visibility: isLoading ? 'hidden' : 'visible' }}
    >
      {!isAuthenticated && (
        <Button icon="log-in" onClick={redirectToLogin}>
          Anmelden
        </Button>
      )}
      {isAuthenticated && (
        <Button icon="user" onClick={() => logout()}>
          Ausloggen
        </Button>
      )}
    </ButtonGroup>
  );
};
