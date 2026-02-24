import { useState, useEffect } from 'react';
import { getDashboard } from '../api';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        setLoading(true);
        getDashboard()
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

    if (loading && !data) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;
    if (error) return <div className="alert alert-error">⚠️ {error}</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Real-time transaction KPIs</p>
            </div>

            <div className="cards-grid">
                <div className="card kpi-card info">
                    <div className="kpi-value">{data.totalTransactions}</div>
                    <div className="kpi-label">Total Transactions</div>
                </div>
                <div className="card kpi-card success">
                    <div className="kpi-value">{data.successRate?.toFixed(1)}%</div>
                    <div className="kpi-label">Success Rate</div>
                </div>
                <div className="card kpi-card danger">
                    <div className="kpi-value">{data.refusedRate?.toFixed(1)}%</div>
                    <div className="kpi-label">Refused Rate</div>
                </div>
                <div className="card kpi-card warning">
                    <div className="kpi-value">{data.avgLatencyMs ? data.avgLatencyMs.toFixed(0) + 'ms' : 'N/A'}</div>
                    <div className="kpi-label">Avg Latency</div>
                </div>
            </div>

            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>BREAKDOWN</h3>
                    <div className="detail-row">
                        <span className="label">Approved (RC 00)</span>
                        <span className="value" style={{ color: 'var(--success)' }}>{data.successCount}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Refused / Error</span>
                        <span className="value" style={{ color: 'var(--danger)' }}>{data.refusedCount}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Timeout / Other</span>
                        <span className="value" style={{ color: 'var(--warning)' }}>
                            {data.totalTransactions - data.successCount - data.refusedCount}
                        </span>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: '3rem' }}>💳</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                        ISO 8583 Payment Simulator<br />
                        <span style={{ color: 'var(--accent)' }}>Ready to process transactions</span>
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={load}>⟳ Refresh</button>
                </div>
            </div>
        </div>
    );
}
