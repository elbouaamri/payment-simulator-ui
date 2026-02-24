import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../api';

export default function TransactionsList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: '', terminalId: '' });
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        getTransactions(filters)
            .then(setTransactions)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const getBadgeClass = (rc) => {
        if (rc === '00') return 'badge-success';
        if (!rc) return 'badge-warning';
        return 'badge-danger';
    };

    const getScenarioLabel = (scenario, rc) => {
        if (!scenario) return rc || '—';
        return scenario;
    };

    return (
        <div>
            <div className="page-header">
                <h2>Transactions</h2>
                <p>History of all processed ISO 8583 transactions</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ minWidth: 160 }}>
                        <label>Response Code</label>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                            <option value="">All</option>
                            <option value="00">00 – Approved</option>
                            <option value="05">05 – Refused</option>
                            <option value="51">51 – Insufficient Funds</option>
                            <option value="54">54 – Expired Card</option>
                            <option value="96">96 – Tech Error</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ minWidth: 160 }}>
                        <label>Terminal ID</label>
                        <input
                            value={filters.terminalId}
                            onChange={e => setFilters(f => ({ ...f, terminalId: e.target.value }))}
                            placeholder="e.g. TERM0001"
                        />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={load}>🔍 Filter</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ status: '', terminalId: '' }); setTimeout(load, 50); }}>
                        Clear
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading transactions...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>MTI</th>
                                <th>PAN</th>
                                <th>Amount</th>
                                <th>Terminal</th>
                                <th>RC 39</th>
                                <th>Scenario</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No transactions found</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/transactions/${tx.id}`)}>
                                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td><span className="badge badge-info">{tx.type}</span></td>
                                        <td style={{ fontFamily: 'monospace' }}>{tx.requestMti} → {tx.responseMti || '—'}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.panMasked}</td>
                                        <td style={{ fontWeight: 600 }}>{(tx.amount / 100).toFixed(2)}</td>
                                        <td>{tx.terminalId}</td>
                                        <td><span className={`badge ${getBadgeClass(tx.responseCode39)}`}>{tx.responseCode39 || 'N/A'}</span></td>
                                        <td style={{ fontSize: '0.82rem' }}>{getScenarioLabel(tx.scenario, tx.responseCode39)}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{tx.durationMs}ms</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
