import { QueryClient, QueryClientProvider } from 'react-query';
import Root from './Root';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>
);

export default App;
