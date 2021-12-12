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
    <Suspense fallback="Loading...">
      <Root />
    </Suspense>
  </QueryClientProvider>
);

export default App;
