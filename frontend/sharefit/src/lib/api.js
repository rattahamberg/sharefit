const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function api(path, {method = 'GET', body, headers = {}} = {}) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: 'include',        // sends/receives the httpOnly JWT cookie
        headers: {'Content-Type': 'application/json', ...headers},
        body: body ? JSON.stringify(body) : undefined
    });

    let data = null;
    try {
        data = await res.json();
    } catch (_) { /* no body */
    }

    if (!res.ok) {
        const msg = normalizeErrorMessage(data) ?? `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

function normalizeErrorMessage(data) {
    if (!data) return null;
    const e = data.error;
    if (!e) return null;
    if (typeof e === 'string') return e;
    if (typeof e?.message === 'string') return e.message;

    // Zod .flatten() shape: { formErrors: string[], fieldErrors: { key: string[] } }
    const form = Array.isArray(e.formErrors) ? e.formErrors.filter(Boolean) : [];
    const field = e.fieldErrors && typeof e.fieldErrors === 'object' ? e.fieldErrors : null;

    const fieldParts = [];
    if (field) {
        for (const [k, arr] of Object.entries(field)) {
            if (Array.isArray(arr) && arr.length) {
                fieldParts.push(`${capitalize(k)}: ${arr.join(', ')}`);
            }
        }
    }
    const combined = [...form, ...fieldParts].join(' ');
    if (combined) return combined;

    try {
        return JSON.stringify(e);
    } catch {
        return String(e);
    }
}

function capitalize(s) {
    return typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s;
}