import { QueryClient, QueryClientProvider } from 'react-query';
import Root from './components/root/Root';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>
);

export default App;
