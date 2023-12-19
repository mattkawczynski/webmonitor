import React, { useEffect, useState } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { Header } from '../../components';
import { Monitoring, Incidents, Incident, Details } from '../../Domain'


import './App.scss'

function App() {
  return (
    <HashRouter>
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
