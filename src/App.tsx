import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { HotkeysProvider } from '@blueprintjs/core';
import { useAtomsDevtools } from 'jotai/devtools';
import { ReactElement, ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Loader } from 'components/loader/Loader';
import Root from 'components/root/Root';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

const AtomsDevtools = ({ children }: { children: ReactElement }) => {
  useAtomsDevtools('app');
  return children;
};

const Suspender = ({
  isSuspended,
  children,
}: {
  isSuspended: boolean;
  children: ReactNode;
}) => {
  if (isSuspended) {
    throw new Promise(() => undefined);
  }

  return <>{children}</>;
};

const App = () => (
  <Auth0Provider
    domain="veggieplan.eu.auth0.com"
    clientId="vGq3zTKCkjUGZMgtieYDD2azr2P5tx8D"
    redirectUri={window.location.origin}
    audience="http://localhost:5303/api"
  >
    <QueryClientProvider client={queryClient}>
      <HotkeysProvider>
        <Content />
      </HotkeysProvider>
    </QueryClientProvider>
  </Auth0Provider>
);

const Content = () => {
  const { t, i18n } = useTranslation();
  const { isLoading } = useAuth0();

  return (
    <Suspense
      fallback={
        <Loader aria-label={t("We're logging you in...")}>
          {t("We're logging you in...")}
        </Loader>
      }
    >
      <Suspender isSuspended={isLoading}>
        <Suspense
          fallback={
            <Loader aria-label={t('Application is loading...')}>
              {t('Application is loading...')}
            </Loader>
          }
        >
          <Root />
        </Suspense>
      </Suspender>
    </Suspense>
  );
};

export default App;
