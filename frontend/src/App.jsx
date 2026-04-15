import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Validators from './pages/Validators';
import RpcHealth from './pages/RpcHealth';
import DataCenterMap from './pages/DataCenterMap';
import MevTracker from './pages/MevTracker';
import BagsEcosystem from './pages/BagsEcosystem';
import Alerts from './pages/Alerts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="validators" element={<Validators />} />
          <Route path="rpc" element={<RpcHealth />} />
          <Route path="map" element={<DataCenterMap />} />
          <Route path="mev" element={<MevTracker />} />
          <Route path="bags" element={<BagsEcosystem />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
