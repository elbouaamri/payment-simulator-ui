import { useState, useEffect } from 'react';
import { getProfiles, createProfile, deleteProfile, getRules, createRule, deleteRule } from '../api';

const SCENARIOS = ['ACCEPT', 'REFUSE', 'TIMEOUT', 'TECH_ERROR', 'EXPIRED_CARD', 'INSUFFICIENT_FUNDS'];
const CONDITION_TYPES = ['PAN_PREFIX', 'AMOUNT_GREATER_THAN', 'TERMINAL_UNKNOWN', 'EXPIRED', 'ALWAYS'];

export default function ProfilesRules() {
    const [profiles, setProfiles] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('profiles');

    // Profile form
    const [pf, setPf] = useState({ name: '', description: '', defaultScenario: 'ACCEPT', latencyMs: 0, amountLimit: '', active: true });
    // Rule form
    const [rf, setRf] = useState({ name: '', priority: 10, enabled: true, conditionType: 'ALWAYS', conditionValue: '', outcomeScenario: 'ACCEPT', responseCode39: '00' });

    const load = async () => {
        setLoading(true);
        try {
            const [p, r] = await Promise.all([getProfiles(), getRules()]);
            setProfiles(p);
            setRules(r);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        try {
            await createProfile({ ...pf, latencyMs: Number(pf.latencyMs), amountLimit: pf.amountLimit ? Number(pf.amountLimit) : null });
            setPf({ name: '', description: '', defaultScenario: 'ACCEPT', latencyMs: 0, amountLimit: '', active: true });
            load();
        } catch (err) { setError(err.message); }
    };

    const handleDeleteProfile = async (id) => {
        await deleteProfile(id);
        load();
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await createRule({ ...rf, priority: Number(rf.priority) });
            setRf({ name: '', priority: 10, enabled: true, conditionType: 'ALWAYS', conditionValue: '', outcomeScenario: 'ACCEPT', responseCode39: '00' });
            load();
        } catch (err) { setError(err.message); }
    };

    const handleDeleteRule = async (id) => {
        await deleteRule(id);
        load();
    };

    if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Profiles & Rules</h2>
                <p>Configure simulation profiles and decision rules</p>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={tab === 'profiles' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setTab('profiles')}>
                    Profiles ({profiles.length})
                </button>
                <button className={tab === 'rules' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setTab('rules')}>
                    Rules ({rules.length})
                </button>
            </div>

            {/* Profiles Tab */}
            {tab === 'profiles' && (
                <>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>CREATE PROFILE</h3>
                        <form onSubmit={handleCreateProfile}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={pf.name} onChange={e => setPf(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. SLOW_TIMEOUT" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input value={pf.description} onChange={e => setPf(p => ({ ...p, description: e.target.value }))} placeholder="Optional" />
                                </div>
                                <div className="form-group">
                                    <label>Default Scenario</label>
                                    <select value={pf.defaultScenario} onChange={e => setPf(p => ({ ...p, defaultScenario: e.target.value }))}>
                                        {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Latency (ms)</label>
                                    <input type="number" value={pf.latencyMs} onChange={e => setPf(p => ({ ...p, latencyMs: e.target.value }))} min={0} />
                                </div>
                                <div className="form-group">
                                    <label>Amount Limit</label>
                                    <input type="number" value={pf.amountLimit} onChange={e => setPf(p => ({ ...p, amountLimit: e.target.value }))} placeholder="Optional" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>+ Create Profile</button>
                        </form>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th><th>Name</th><th>Scenario</th><th>Latency</th><th>Limit</th><th>Active</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td><span className="badge badge-info">{p.defaultScenario}</span></td>
                                        <td>{p.latencyMs}ms</td>
                                        <td>{p.amountLimit ?? '—'}</td>
                                        <td>{p.active ? '✅' : '❌'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProfile(p.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Rules Tab */}
            {tab === 'rules' && (
                <>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>CREATE RULE</h3>
                        <form onSubmit={handleCreateRule}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={rf.name} onChange={e => setRf(r => ({ ...r, name: e.target.value }))} required placeholder="e.g. Block High Amounts" />
                                </div>
                                <div className="form-group">
                                    <label>Priority (lower = higher)</label>
                                    <input type="number" value={rf.priority} onChange={e => setRf(r => ({ ...r, priority: e.target.value }))} min={1} />
                                </div>
                                <div className="form-group">
                                    <label>Condition Type</label>
                                    <select value={rf.conditionType} onChange={e => setRf(r => ({ ...r, conditionType: e.target.value }))}>
                                        {CONDITION_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Condition Value</label>
                                    <input value={rf.conditionValue} onChange={e => setRf(r => ({ ...r, conditionValue: e.target.value }))} placeholder="e.g. 4 or 50000" />
                                </div>
                                <div className="form-group">
                                    <label>Outcome Scenario</label>
                                    <select value={rf.outcomeScenario} onChange={e => setRf(r => ({ ...r, outcomeScenario: e.target.value }))}>
                                        {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Response Code (F39)</label>
                                    <input value={rf.responseCode39} onChange={e => setRf(r => ({ ...r, responseCode39: e.target.value }))} maxLength={2} placeholder="00" />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>+ Create Rule</button>
                        </form>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Priority</th><th>Name</th><th>Condition</th><th>Value</th><th>Outcome</th><th>RC39</th><th>Enabled</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.sort((a, b) => a.priority - b.priority).map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{r.priority}</td>
                                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                                        <td><span className="badge badge-info">{r.conditionType}</span></td>
                                        <td style={{ fontFamily: 'monospace' }}>{r.conditionValue || '—'}</td>
                                        <td><span className="badge badge-warning">{r.outcomeScenario}</span></td>
                                        <td style={{ fontWeight: 700 }}>{r.responseCode39}</td>
                                        <td>{r.enabled ? '✅' : '❌'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRule(r.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
