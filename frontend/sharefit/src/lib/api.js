const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: 'include',        // sends/receives the httpOnly JWT cookie
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    try { data = await res.json(); } catch (_) { /* no body */ }

    if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}