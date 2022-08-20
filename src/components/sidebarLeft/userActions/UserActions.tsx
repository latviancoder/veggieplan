import { useAuth0 } from '@auth0/auth0-react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useAtomValue } from 'jotai/utils';

import { objectsInMetersAtom, configAtom, varietiesAtom } from 'atoms';

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
