import { HotkeysProvider } from '@blueprintjs/core';
import { ReactElement, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAtomsDevtools } from 'jotai/devtools';

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
  <QueryClientProvider client={queryClient}>
    <HotkeysProvider>
      <Suspense fallback="Es wird geladen...">
        <Root />
      </Suspense>
    </HotkeysProvider>
  </QueryClientProvider>
);

export default App;
