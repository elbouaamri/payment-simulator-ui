const API_BASE = '/api/v1';

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
}

// --- Transactions ---
export const sendTransaction = (type, data) =>
    request(`/transactions/${type}`, { method: 'POST', body: JSON.stringify(data) });

export const getTransaction = (id) => request(`/transactions/${id}`);

export const getTransactions = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.append(k, v); });
    const query = qs.toString();
    return request(`/transactions${query ? '?' + query : ''}`);
};

// --- Dashboard ---
export const getDashboard = () => request('/dashboard');

// --- Profiles ---
export const getProfiles = () => request('/profiles');
export const createProfile = (data) =>
    request('/profiles', { method: 'POST', body: JSON.stringify(data) });
export const updateProfile = (id, data) =>
    request(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProfile = (id) =>
    request(`/profiles/${id}`, { method: 'DELETE' }).catch(() => null);

// --- Rules ---
export const getRules = () => request('/rules');
export const createRule = (data) =>
    request('/rules', { method: 'POST', body: JSON.stringify(data) });
export const updateRule = (id, data) =>
    request(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRule = (id) =>
    request(`/rules/${id}`, { method: 'DELETE' }).catch(() => null);

// --- Terminals ---
export const getTerminals = () => request('/terminals');
