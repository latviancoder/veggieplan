import { useAuth0 } from '@auth0/auth0-react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';

export const UserActions = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth0();

  const redirectToLogin = () => {
    loginWithRedirect({
      ui_locales: i18n.resolvedLanguage,
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
          {t('Sign in')}
        </Button>
      )}
      {isAuthenticated && (
        <Button icon="user" onClick={() => logout()}>
          {t('Logout')}
        </Button>
      )}
    </ButtonGroup>
  );
};
