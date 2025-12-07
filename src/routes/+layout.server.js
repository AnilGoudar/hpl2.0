import { hplFetch } from '$lib/utils/api.js';

export async function load({ fetch }) {
	const teamsResponse = await hplFetch(fetch, '/teams', 'GET');
	const playerCategoriesResponse = await hplFetch(fetch, '/player-categories', 'GET');
	const seasonResponse = await hplFetch(fetch, '/season', 'GET');
	const teamsData = await teamsResponse.json();
	const playerCats = await playerCategoriesResponse.json();
	const seasonsData = await seasonResponse.json();
	return {
		teams: teamsData,
		playerCategories: playerCats,
		seasons: seasonsData
	};
}
