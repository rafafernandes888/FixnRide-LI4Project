export function parseJwt(token) {
    if (!token) return null;
    try {
        const base64Payload = token.split('.')[1];
        const decoded = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function getAuthPayload() {
    return parseJwt(localStorage.getItem('token'));
}

export function getOperadorNumero() {
    return getAuthPayload()?.id ?? null;
}

export function logout(queryClient) {
    try {
        localStorage.removeItem('token');
        if (queryClient && typeof queryClient.clear === 'function') {
            queryClient.clear();
        }
    } finally {
        window.location.href = '/auth';
    }
}
