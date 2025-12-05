
export async function hplFetch(path, method = 'GET', body = null, headers = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    const config = {
        method,
        headers: {
            ...defaultHeaders,
        }
    };

    if (body !== null && ['POST', 'PUT'].includes(method)) {
        config.body = JSON.stringify(body);
    }
    
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await fetch(`/api${path}`, config);
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                errorData = {
                    message: response.statusText || 'Unknown error'
                }
            }
            const error = new Error(errorData.message || response.statusText || `HTTP error! Status: ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        return response;
    } catch (e) {
        throw e;
    }
}