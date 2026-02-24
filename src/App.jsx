import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SendTransaction from './pages/SendTransaction';
import TransactionsList from './pages/TransactionsList';
import TransactionDetail from './pages/TransactionDetail';
import ProfilesRules from './pages/ProfilesRules';

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <aside className="sidebar">
                    <div className="sidebar-brand">
                        <h1>💳 Payment Sim</h1>
                        <p>ISO 8583 Simulator</p>
                    </div>
                    <ul className="sidebar-nav">
                        <li>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
                                <span className="nav-icon">📊</span>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/send" className={({ isActive }) => isActive ? 'active' : ''}>
                                <span className="nav-icon">💸</span>
                                <span>Send Transaction</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
                                <span className="nav-icon">📋</span>
                                <span>Transactions</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/config" className={({ isActive }) => isActive ? 'active' : ''}>
                                <span className="nav-icon">⚙️</span>
                                <span>Profiles & Rules</span>
                            </NavLink>
                        </li>
                    </ul>
                </aside>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/send" element={<SendTransaction />} />
                        <Route path="/transactions" element={<TransactionsList />} />
                        <Route path="/transactions/:id" element={<TransactionDetail />} />
                        <Route path="/config" element={<ProfilesRules />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
