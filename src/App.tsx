import { HotkeysProvider } from '@blueprintjs/core';
import { ReactElement, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAtomsDevtools } from 'jotai/devtools';
import { Auth0Provider } from '@auth0/auth0-react';

import Root from './components/root/Root';

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

const App = () => (
  <Auth0Provider
    domain="veggieplan.eu.auth0.com"
    clientId="vGq3zTKCkjUGZMgtieYDD2azr2P5tx8D"
    redirectUri={window.location.origin}
  >
    <QueryClientProvider client={queryClient}>
      <HotkeysProvider>
        <Suspense fallback="Es wird geladen...">
          <Root />
        </Suspense>
      </HotkeysProvider>
    </QueryClientProvider>
  </Auth0Provider>
);

export default App;
