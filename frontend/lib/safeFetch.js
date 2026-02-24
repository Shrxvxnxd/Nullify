/**
 * safeFetch – like fetch() but always resolves to JSON.
 * If the server returns an HTML error page (404, 500, etc.),
 * it throws a readable error instead of a cryptic JSON parse error.
 */
export async function safeFetch(url, options = {}) {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${res.status}) for ${url}`);
    }
    const data = await res.json();
    return data;
}
