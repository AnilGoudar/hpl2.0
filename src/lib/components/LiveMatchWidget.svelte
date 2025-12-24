<script>
	import { getHeaderAuthorisation } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';
	import DisplayTeamLogoName from './DisplayTeamLogoName.svelte';
	import { supabase } from '$lib/supabaseClient';

	let matchData = $state(null);
	let match = $derived.by(() => matchData?.live_match);
	let fixtureId = $state(null);

	async function getLiveMatchData() {
		try {
			console.log(fixtureId);
			if (!fixtureId) return;
			const headers = getHeaderAuthorisation();
			const data = await hplFetch(
				fetch,
				`/fixtures/live/match-lineups/${fixtureId}`,
				'GET',
				null,
				headers
			);
			matchData = await data.json();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		const data = await hplFetch(fetch, '/fixtures/live');
		const liveFixtures = await data.json();
		fixtureId = liveFixtures.fixture_id;
	});

	$effect(() => {
		if (!fixtureId) return;
		getLiveMatchData();

		const channel = supabase
			.channel(`dashboard_${fixtureId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'live_matches',
					filter: `fixture_id=eq.${fixtureId}`
				},
				() => {
					getLiveMatchData();
				}
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	});
</script>

{#if match}
	<a
		href={`/admin/match/score/${match.fixture_id}`}
		class="relative w-full block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 max-w-md mx-auto group overflow-hidden"
	>
		<div
			class="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors animate-ping"
		></div>
		<div class="flex justify-between items-start mb-4">
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<DisplayTeamLogoName teamId={match.batting_team_id} />
					<span class="text-xl font-black text-slate-800">
						{match.current_inning_runs} <span class="text-slate-400 font-medium">/</span>
						{match.current_inning_wickets}
					</span>
				</div>

				<div class="flex items-center gap-3 opacity-50">
					<DisplayTeamLogoName teamId={match.bowling_team_id} />
					<span class="text-sm font-bold">Yet to bat</span>
				</div>
			</div>

			<div class="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-100">
				<span class="relative flex h-2 w-2">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
				</span>
				<span class="text-[10px] font-black text-red-600 uppercase tracking-wider">Live</span>
			</div>
		</div>

		<div class="flex justify-between items-center pt-3 border-t border-slate-50">
			<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
				Over {Math.floor(match.total_balls / 6)}.{match.total_balls % 6}
			</span>
		</div>
	</a>
{/if}
