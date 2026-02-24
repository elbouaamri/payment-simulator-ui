import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransaction } from '../api';

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tx, setTx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getTransaction(id)
            .then(setTx)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;
    if (error) return <div className="alert alert-error">⚠️ {error}</div>;
    if (!tx) return <div className="alert alert-error">Transaction not found</div>;

    const getBadgeClass = (rc) => {
        if (rc === '00') return 'badge-success';
        if (!rc) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transactions')}>← Back</button>
                    <div>
                        <h2>Transaction Detail</h2>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.id}</p>
                    </div>
                </div>
            </div>

            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card">
                    <div className="detail-section">
                        <h3>General</h3>
                        <div className="detail-row"><span className="label">Type</span><span className="value">{tx.type}</span></div>
                        <div className="detail-row"><span className="label">Visa-like</span><span className="value">{tx.visaLike ? 'Yes' : 'No'}</span></div>
                        <div className="detail-row"><span className="label">Request MTI</span><span className="value">{tx.requestMti}</span></div>
                        <div className="detail-row"><span className="label">Response MTI</span><span className="value">{tx.responseMti || '—'}</span></div>
                        <div className="detail-row">
                            <span className="label">Response Code (F39)</span>
                            <span className={`badge ${getBadgeClass(tx.responseCode39)}`}>{tx.responseCode39 || 'N/A'}</span>
                        </div>
                        <div className="detail-row"><span className="label">Scenario</span><span className="value">{tx.scenario}</span></div>
                        <div className="detail-row"><span className="label">Duration</span><span className="value">{tx.durationMs}ms</span></div>
                        <div className="detail-row"><span className="label">Created</span><span className="value">{new Date(tx.createdAt).toLocaleString()}</span></div>
                    </div>
                </div>

                <div className="card">
                    <div className="detail-section">
                        <h3>Transaction Data</h3>
                        <div className="detail-row"><span className="label">PAN (masked)</span><span className="value" style={{ fontFamily: 'monospace' }}>{tx.panMasked}</span></div>
                        <div className="detail-row"><span className="label">Amount</span><span className="value">{(tx.amount / 100).toFixed(2)} {tx.currency}</span></div>
                        <div className="detail-row"><span className="label">STAN</span><span className="value">{tx.stan}</span></div>
                        <div className="detail-row"><span className="label">RRN</span><span className="value">{tx.rrn}</span></div>
                        <div className="detail-row"><span className="label">Terminal</span><span className="value">{tx.terminalId}</span></div>
                        <div className="detail-row"><span className="label">Correlation ID</span><span className="value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{tx.correlationId}</span></div>
                    </div>
                </div>
            </div>

            {/* Raw ISO Data */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="detail-section">
                    <h3>ISO Fields (Request)</h3>
                    <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                        {tx.requestIsoFields || 'N/A'}
                    </div>
                </div>
                <div className="detail-section" style={{ marginTop: 16 }}>
                    <h3>ISO Fields (Response)</h3>
                    <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                        {tx.responseIsoFields || 'N/A'}
                    </div>
                </div>
                <div className="detail-section" style={{ marginTop: 16 }}>
                    <h3>Raw ISO Hex (Request)</h3>
                    <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all', color: 'var(--text-muted)', maxHeight: 120, overflow: 'auto' }}>
                        {tx.requestIsoRaw || 'N/A'}
                    </div>
                </div>
                <div className="detail-section" style={{ marginTop: 16 }}>
                    <h3>Raw ISO Hex (Response)</h3>
                    <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all', color: 'var(--text-muted)', maxHeight: 120, overflow: 'auto' }}>
                        {tx.responseIsoRaw || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
}
