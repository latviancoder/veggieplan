import React from 'react';

import styles from './App.module.css';
import { Sidebar } from './Sidebar';
import { Container } from './Container';

function App() {
  return (
    <div className={styles.root}>
      <Sidebar />
      <Container />
    </div>
  );
}

export default App;
