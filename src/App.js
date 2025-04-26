import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes as Routers, useLocation, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import Topbar from './components/Topbar';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';

import './assets/css/style.css';
import './assets/css/mystyle.css';
import './components/Auth/login.css';
import './components/Form/ParkingForm.css'
import './components/Management/management.css';
import EmptyParking from './components/EmptyParking/EmptyParking';
import Management from './components/Management/Management';
import Password from './components/Password/Password';
import Setting from './components/Setting/Setting';
import Help from './components/Help/Help';
import LoginForm from './components/Auth/Login';
import RegisterForm from './components/Auth/Register';
import { DndProvider } from 'react-dnd';
import DndWrapper from './components/DndWraper';
import PrivateRoute from './components/Auth/PrivateRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();
const AppRoutes = ({ navActive, handleToggle }) => {
    const location = useLocation();
    // Ẩn Navigation và Topbar nếu đang ở trang login hoặc register
    const hideNav = location.pathname === '/login' || location.pathname === '/register';

    return (
        <>
            {!hideNav && <Navigation active={navActive ? "active" : ""} />}
            <div className={`main ${navActive ? "active" : ""}`}>
                {!hideNav && <Topbar onToggle={handleToggle} />}
                <Outlet />
            </div>
        </>
    );
};
const App = () => {
    const [navActive, setNavActive] = useState(false);
    const handleToggle = () => {
        setNavActive(!navActive);
    }
    return (

        <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>
                <Router>
                    <Routers>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/" element={<PrivateRoute><AppRoutes navActive={navActive} handleToggle={handleToggle} /></PrivateRoute>}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="empty-parking" element={<EmptyParking />} />
                            <Route path="management" element={<Management />} />
                            <Route path="password" element={<Password />} />
                            <Route path="setting" element={<Setting />} />
                            <Route path="help" element={<Help />} />
                    </Route>
                    </Routers>
                </Router>
            </DndProvider>
        </QueryClientProvider>
    );
};

export default App;