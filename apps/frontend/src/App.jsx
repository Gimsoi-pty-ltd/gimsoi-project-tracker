import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SideBar from './components/SideBar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Kanban from './pages/Kanban';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <SideBar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
