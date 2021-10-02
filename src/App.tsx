import styles from './App.module.css';
import { Sidebar } from './components/sidebar/Sidebar';
import { Zoom } from './components/zoom/Zoom';
import { Container } from './Container';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.root}>
        <Sidebar />
        <Container />
        <Zoom />
      </div>
    </QueryClientProvider>
  );
};

export default App;
