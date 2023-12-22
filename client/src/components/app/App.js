import React from 'react';
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";
import { Header } from '../../components';
import { Titlebar  } from '../../components/Titlebar';
import { Monitoring, Incidents, Incident, Details } from '../../Domain'


import './App.scss'

function App() {
  return (
    <HashRouter>

      <Titlebar />
      <Header />
      <main>
        
        <Routes>
          <Route path="" element={<Monitoring />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="incidents" element={<Incidents />} />
        
          <Route path="/incident/:_id" element={<Incident />} />
          <Route path="/details/:_id" element={<Details />} />

        </Routes>
      </main>
    </HashRouter>
  )
}

export default App
