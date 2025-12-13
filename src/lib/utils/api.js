export async function hplFetch(fetchFn = fetch, path, method = 'GET', body = null, headers = {}) {
	const defaultHeaders = {
		'Content-Type': 'application/json',
		credentials: 'include',
		...headers
	};
	const config = {
		method,
		headers: {
			...defaultHeaders
		}
	};

	if (body instanceof FormData) {
		config.body = body;
		delete config.headers['Content-Type'];
	} else if (body !== null && ['POST', 'PUT'].includes(method)) {
		config.body = JSON.stringify(body);
	}

	// eslint-disable-next-line no-useless-catch
	try {
		const run = () => fetchFn(`/api${path}`, config);
		let response = await run();
		if (response.status === 401) {
			const refresh = await fetchFn('/api/session', { method: 'GET' });
			if (refresh.ok) {
				response = await run();
			} else {
				throw new Error('Session Expired. Login again');
			}
		}
		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
				// eslint-disable-next-line no-unused-vars
			} catch (error) {
				errorData = {
					message: response.statusText || 'Unknown error'
				};
			}
			const error = new Error(
				errorData.message || response.statusText || `HTTP error! Status: ${response.status}`
			);
			error.status = response.status;
			error.data = errorData;
			throw error;
		}
		return response;
	} catch (e) {
		throw e;
	}
}
