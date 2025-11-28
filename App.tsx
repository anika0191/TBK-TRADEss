import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { TradeProvider } from './context/TradeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { Analytics } from './components/Analytics';
import { AICoach } from './components/AICoach';
import { ChartPage } from './components/ChartPage';

const App: React.FC = () => {
  return (
    <TradeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/add" element={<TradeForm />} />
            <Route path="/history" element={<TradeList />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/coach" element={<AICoach />} />
          </Routes>
        </Layout>
      </Router>
    </TradeProvider>
  );
};

export default App;