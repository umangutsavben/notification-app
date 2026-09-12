import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

// Placeholders for other pages
const Users = () => <div>Users Page Placeholder</div>;
const Notifications = () => <div>Notifications Page Placeholder</div>;
const History = () => <div>Notification History Placeholder</div>;
const Settings = () => <div>Settings Page Placeholder</div>;
const Login = () => <div>Login Page Placeholder</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes Wrapper Placeholder */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
