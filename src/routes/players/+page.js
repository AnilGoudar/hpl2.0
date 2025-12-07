import { hplFetch } from '$lib/utils/api';

export async function load({ fetch }) {
	try {
		const response = await hplFetch(fetch, '/players', 'GET');
		if (response.ok) {
			const data = await response.json();
			return {
				players: data
			};
		}
	} catch (e) {
		return { error: true, message: e.message };
	}
}
