import { useState, useEffect } from 'react';
import { sendTransaction, getProfiles } from '../api';

const TYPES = ['authorize', 'refund', 'cancel', 'reversal'];

const defaultForm = {
    pan: '4111111111111111',
    expiry: '2812',
    amount: 10000,
    currency: '504',
    terminalId: 'TERM0001',
    merchantId: '',
    stan: '',
    rrn: '',
    profileId: '',
    visaLike: false,
};

export default function SendTransaction() {
    const [form, setForm] = useState(defaultForm);
    const [type, setType] = useState('authorize');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        getProfiles().then(setProfiles).catch(() => { });
    }, []);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setForm(f => ({ ...f, [name]: inputType === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const payload = {
                ...form,
                type: type.toUpperCase(),
                amount: Number(form.amount),
                profileId: form.profileId ? Number(form.profileId) : null,
            };
            const res = await sendTransaction(type, payload);
            setResult(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeClass = (rc) => {
        if (rc === '00') return 'badge-success';
        if (!rc) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div>
            <div className="page-header">
                <h2>Send Transaction</h2>
                <p>Simulate an ISO 8583 TPE / Visa-like transaction</p>
            </div>

            <div className="card" style={{ marginBottom: 28 }}>
                <form onSubmit={handleSubmit}>
                    {/* Transaction Type Selector */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {TYPES.map(t => (
                            <button
                                key={t}
                                type="button"
                                className={type === t ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                                onClick={() => setType(t)}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>PAN</label>
                            <input name="pan" value={form.pan} onChange={handleChange} placeholder="4111111111111111" required />
                        </div>
                        <div className="form-group">
                            <label>Expiry (YYMM)</label>
                            <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="2812" maxLength={4} />
                        </div>
                        <div className="form-group">
                            <label>Amount (minor units)</label>
                            <input name="amount" type="number" value={form.amount} onChange={handleChange} required min={1} />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <input name="currency" value={form.currency} onChange={handleChange} placeholder="504" />
                        </div>
                        <div className="form-group">
                            <label>Terminal ID</label>
                            <input name="terminalId" value={form.terminalId} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Merchant ID</label>
                            <input name="merchantId" value={form.merchantId} onChange={handleChange} placeholder="Optional" />
                        </div>
                        <div className="form-group">
                            <label>STAN</label>
                            <input name="stan" value={form.stan} onChange={handleChange} placeholder="Auto-generated" />
                        </div>
                        <div className="form-group">
                            <label>RRN</label>
                            <input name="rrn" value={form.rrn} onChange={handleChange} placeholder="Auto-generated" />
                        </div>
                        <div className="form-group">
                            <label>Profile</label>
                            <select name="profileId" value={form.profileId} onChange={handleChange}>
                                <option value="">Default (FAST_ACCEPT)</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Visa-like</label>
                            <div className="checkbox-row">
                                <input type="checkbox" name="visaLike" checked={form.visaLike} onChange={handleChange} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Use Visa MTI mapping + fake EMV
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Processing...' : '🚀 Send Transaction'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setForm(defaultForm); setResult(null); setError(null); }}>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {result && (
                <div className="card response-panel">
                    <div className="response-header">
                        <span className={`badge ${getBadgeClass(result.responseCode39)}`}>
                            {result.scenario}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            RC {result.responseCode39 || 'N/A'} — {result.scenarioDescription}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {result.durationMs}ms
                        </span>
                    </div>

                    <div className="detail-section">
                        <h3>Transaction Info</h3>
                        <div className="detail-row"><span className="label">Transaction ID</span><span className="value">{result.transactionId}</span></div>
                        <div className="detail-row"><span className="label">Request MTI</span><span className="value">{result.requestMti}</span></div>
                        <div className="detail-row"><span className="label">Response MTI</span><span className="value">{result.responseMti || '—'}</span></div>
                        <div className="detail-row"><span className="label">PAN (masked)</span><span className="value">{result.panMasked}</span></div>
                        <div className="detail-row"><span className="label">STAN</span><span className="value">{result.stan}</span></div>
                        <div className="detail-row"><span className="label">RRN</span><span className="value">{result.rrn}</span></div>
                        {result.fakeCryptogram && (
                            <div className="detail-row"><span className="label">Fake Cryptogram</span><span className="value" style={{ fontFamily: 'monospace' }}>{result.fakeCryptogram}</span></div>
                        )}
                        <div className="detail-row"><span className="label">Correlation ID</span><span className="value" style={{ fontSize: '0.78rem' }}>{result.correlationId}</span></div>
                    </div>

                    {result.requestIsoFields && (
                        <div className="detail-section">
                            <h3>Request ISO Fields</h3>
                            <div className="iso-fields">
                                {Object.entries(result.requestIsoFields).map(([k, v]) => (
                                    <div key={k} className="iso-field">
                                        <span className="field-name">{k}</span>
                                        <span className="field-value">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.responseIsoFields && (
                        <div className="detail-section">
                            <h3>Response ISO Fields</h3>
                            <div className="iso-fields">
                                {Object.entries(result.responseIsoFields).map(([k, v]) => (
                                    <div key={k} className="iso-field">
                                        <span className="field-name">{k}</span>
                                        <span className="field-value">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
