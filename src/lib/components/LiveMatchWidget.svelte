<script>
	import { getHeaderAuthorisation } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';
	import DisplayTeamLogoName from './DisplayTeamLogoName.svelte';

	let liveMatch = null;
	let channel;

	async function getLiveMatch() {
		const headers = getHeaderAuthorisation();
		const resp = await hplFetch(fetch, '/fixtures/live', 'GET', null, headers);
		if (resp.ok) {
			liveMatch = await resp.json();
			console.log(liveMatch);
		}
	}

	onMount(async () => {
		await getLiveMatch();
	});
</script>

{#if liveMatch}
	<a
		href={`/admin/match/score/${liveMatch.fixture_id}`}
		class="w-full block bg-red-300 rounded-xl p-4 shadow-2xl hover:border-red-500 transition-colors duration-300 max-w-md mx-auto"
	>
		<div class="flex justify-between items-center mb-4">
			<div class="flex">
				<DisplayTeamLogoName teamId={liveMatch.batting_team_id} />
				<div class="">
					{liveMatch.current_inning_runs}/ {liveMatch.current_inning_wickets}
				</div>
			</div>
			<div class="flex items-center gap-2 bg-red-600/10 px-2 py-1 rounded">
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
				</span>
				<span class="text-[10px] font-black text-red-500 uppercase italic">Live</span>
			</div>
		</div>

		<div class="flex items-center justify-between gap-4">
			<div class="flex-1 text-center">
				<div class="text-white font-bold text-sm uppercase truncate">
					{liveMatch.home_team_name}
				</div>
			</div>

			<div class="flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-700">
				<span class="text-2xl font-black text-white">{liveMatch.home_score}</span>
				<span class="text-zinc-600 font-bold">-</span>
				<span class="text-2xl font-black text-white">{liveMatch.away_score}</span>
			</div>

			<div class="flex-1 text-center">
				<div class="text-white font-bold text-sm uppercase truncate">
					{liveMatch.away_team_name}
				</div>
			</div>
		</div>

		<div class="mt-4 flex justify-center italic text-xs text-zinc-500">
			<span>{liveMatch.match_minute}' Minutes Played</span>
		</div>
	</a>
{/if}
