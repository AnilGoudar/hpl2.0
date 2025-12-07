import { hplFetch } from '$lib/utils/api';

export async function load({ fetch, parent }) {
	const parentData = await parent();
	const seasons = parentData?.seasons;
	const currentSeason = seasons?.find((season) => ['Scheduled', 'Active'].includes(season.status));
	let currentSeasonId = currentSeason?.id;
	if (currentSeasonId) {
		const standingsResponse = await hplFetch(
			fetch,
			`/points/standings?season_id=${currentSeasonId}`,
			'GET'
		);
		const standingsData = await standingsResponse.json();
		return {
			standingsData
		};
	}
}
