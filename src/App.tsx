import { HotkeysProvider } from '@blueprintjs/core';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import Root from './components/root/Root';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HotkeysProvider>
      <Suspense fallback="Es wird geladen...">
        <Root />
      </Suspense>
    </HotkeysProvider>
  </QueryClientProvider>
);

export default App;
