<script>
	import { getHeaderAuthorisation } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';
	import DisplayTeamLogoName from './DisplayTeamLogoName.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { userState } from '$lib/state/+state.svelte';
	import Avatar from './Avatar.svelte';

	let matchData = $state(null);
	let match = $derived.by(() => matchData?.live_match);
	let fixtureId = $state(null);

	// Derived values for the UI
	let maxBalls = $derived(match?.max_balls_per_innings ?? 48);
	let currentOver = $derived(`${Math.floor(match?.total_balls / 6)}.${match?.total_balls % 6}`);
	let maxOver = $derived(`${Math.floor(maxBalls / 6)}.${maxBalls % 6}`);

	// 2nd Innings specific logic
	let isSecondInnings = $derived(match?.current_inning === 2);
	let target = $derived(isSecondInnings ? match.first_innings_total + 1 : null);
	let runsNeeded = $derived(target ? target - match.current_inning_runs : null);

	let strikerStats = $state(null);
	let nonStrikerStats = $state(null);
	let bowlerStats = $state(null);

	async function getLiveMatchData() {
		try {
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
			getActiveStats();
		} catch (e) {
			console.log(e);
		}
	}

	async function getActiveStats() {
		if (!match) return;
		const { data } = await supabase
			.from('player_stats')
			.select('*')
			.eq('fixture_id', fixtureId)
			.in('player_id', [match.striker_id, match.non_striker_id, match.current_bowler_id]);

		if (data) {
			strikerStats = data.find((p) => p.player_id === match.striker_id);
			nonStrikerStats = data.find((p) => p.player_id === match.non_striker_id);
			bowlerStats = data.find((p) => p.player_id === match.current_bowler_id);
			strikerStats = {
				...strikerStats,
				name: getPlayerName(match.striker_id)
			};
			nonStrikerStats = {
				...nonStrikerStats,
				name: getPlayerName(match.non_striker_id)
			};
			bowlerStats = {
				...bowlerStats,
				name: getPlayerName(match.current_bowler_id, 'bowling')
			};
		}
	}

	onMount(async () => {
		const data = await hplFetch(fetch, '/fixtures/live');
		const liveFixtures = await data.json();
		fixtureId = liveFixtures?.fixture_id;
	});

	$effect(() => {
		// Listen to player_stats directly for lightning fast UI updates
		const channel = supabase
			.channel('live_player_updates')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'player_stats',
					filter: `fixture_id=eq.${fixtureId}`
				},
				getActiveStats
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	$effect(() => {
		// 1. Listen for ANY change in the fixtures table where status might become 'live'
		const globalFixtureChannel = supabase
			.channel('any_live_fixture')
			.on(
				'postgres_changes',
				{
					event: '*', // Listen for inserts or updates
					schema: 'public',
					table: 'fixtures'
				},
				(payload) => {
					// Check if a match just went live
					if (payload.new.status === 'live') {
						fixtureId = payload.new.id;
						// This update to fixtureId will trigger the $effect again
						// or trigger getLiveMatchData() via the logic below
					}

					// If the current live match is completed, reset
					if (payload.new.id === fixtureId && payload.new.status === 'completed') {
						fixtureId = null;
						matchData = null;
					}
				}
			)
			.subscribe();

		// 2. Only if we have a fixtureId (either from onMount or from the listener above)
		// do we listen to the specific score updates
		let scoreChannel;
		if (fixtureId) {
			getLiveMatchData();

			scoreChannel = supabase
				.channel(`live_score_${fixtureId}`)
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'live_matches',
						filter: `fixture_id=eq.${fixtureId}`
					},
					() => getLiveMatchData()
				)
				.subscribe();
		}

		return () => {
			supabase.removeChannel(globalFixtureChannel);
			if (scoreChannel) supabase.removeChannel(scoreChannel);
		};
	});

	// Helper to get team name by ID from the matchData
	let getTeamName = $derived((id) => {
		if (match?.batting_team_id === id) return matchData?.batting_team?.name || 'Batting Team';
		if (match?.bowling_team_id === id) return matchData?.bowling_team?.name || 'Bowling Team';
		return 'Team';
	});

	let getPlayerName = $derived((id, team = 'batting') => {
		if (matchData?.batting_players && team === 'batting') {
			const player = matchData.batting_players.find((p) => p.player_id === id);
			return player ? player.name : 'Batsman';
		}
		if (matchData?.bowling_players) {
			const player = matchData.bowling_players.find((p) => p.player_id === id);
			return player ? player.name : 'Bowler';
		}
	});

	let isMatchOver = $derived.by(() => {
		if (!match || match.current_inning !== 2) return false;
		const target = match.first_innings_total + 1;
		return (
			match.current_inning_runs >= target ||
			match.current_inning_wickets >= 10 ||
			match.total_balls >= maxBalls
		);
	});

	let resultData = $derived.by(() => {
		if (!isMatchOver) return null;
		const target = match.first_innings_total + 1;

		if (match.current_inning_runs >= target) {
			return {
				winner: getTeamName(match.batting_team_id),
				margin: `${10 - match.current_inning_wickets} wickets`
			};
		} else if (match.current_inning_runs < match.first_innings_total) {
			return {
				winner: getTeamName(match.bowling_team_id),
				margin: `${match.first_innings_total - match.current_inning_runs} runs`
			};
		}
		return { winner: 'Match', margin: 'Tied' };
	});
</script>

{#if match}
	<a
		href={isMatchOver
			? `/match/summary/${match.fixture_id}`
			: ['Admin', 'Super Admin'].includes(userState.role)
				? `/admin/match/score/${match.fixture_id}`
				: `/match/live/${match.fixture_id}`}
		class="relative w-full block border rounded-2xl p-5 transition-all duration-300 max-w-md mx-auto group overflow-hidden
        {isMatchOver
			? 'bg-slate-50 border-indigo-200'
			: 'bg-white border-slate-200 hover:shadow-lg'}"
	>
		<div class="flex justify-between items-center mb-4">
			<div class="flex items-center gap-2">
				{#if isMatchOver}
					<span
						class="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded"
						>Result</span
					>
				{:else}
					<span class="relative flex h-2 w-2">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
						></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
					</span>
					<span class="text-[10px] font-black text-red-600 uppercase tracking-widest">Live</span>
				{/if}
				<span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
					>Innings {match.current_inning}</span
				>
			</div>

			<div class="text-right">
				<span class="text-xs font-mono font-bold text-slate-600">
					{currentOver} <span class="text-slate-300">/</span>
					{maxOver}
				</span>
			</div>
		</div>

		<div class="flex justify-between items-end mb-5">
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<DisplayTeamLogoName teamId={match.batting_team_id} />
					<span class="text-3xl font-black text-slate-900 tracking-tighter">
						{match.current_inning_runs}<span class="text-slate-300 mx-0.5">/</span
						>{match.current_inning_wickets}
					</span>
				</div>
				<div class="flex items-center gap-3 opacity-50">
					<DisplayTeamLogoName teamId={match.bowling_team_id} size="sm" />
					{#if !isSecondInnings && !isMatchOver}
						<span class="text-[10px] font-bold uppercase text-slate-500 italic">Yet to bat</span>
					{:else if isSecondInnings && !isMatchOver}
						<span class="text-[10px] font-bold uppercase text-slate-800 tracking-tight"
							>Target: {target}</span
						>
					{/if}
				</div>
			</div>
		</div>

		{#if strikerStats || nonStrikerStats || bowlerStats}
			<hr class="border-slate-200 mb-4" />
			<div class="flex flex-col gap-2 text-sm">
				<div class="flex items-center mb-1">
					<Avatar
						name={strikerStats ? strikerStats.name : 'Striker'}
						size="sm"
						class="inline-block mr-2"
						isStriker={true}
					/>
					<span class="text-slate-800 tracking-tight">
						{strikerStats ? `${strikerStats.runs_scored} (${strikerStats.balls_faced})` : '0 (0)'}
					</span>
				</div>
				<div class="flex items-center mb-1">
					<Avatar
						name={nonStrikerStats ? nonStrikerStats.name : 'Non-Striker'}
						size="sm"
						class="inline-block mr-2"
						isStriker={false}
					/>
					<span class="text-slate-800 tracking-tight">
						{nonStrikerStats
							? `${nonStrikerStats.runs_scored} (${nonStrikerStats.balls_faced})`
							: '0 (0)'}
					</span>
				</div>
				<div class="text-sm text-slate-500 uppercase">Bowling</div>
				<div class="flex items-center mb-1">
					<Avatar
						name={bowlerStats ? bowlerStats.name : 'Bowler'}
						size="sm"
						class="inline-block mr-2"
					/>
					<span class="text-slate-800 tracking-tight">
						{bowlerStats
							? `${bowlerStats.wickets}-${bowlerStats.runs_conceded} (${Math.floor(bowlerStats?.balls_bowled / 6)}.${bowlerStats?.balls_bowled % 6})`
							: '0-0 (0)'}
					</span>
				</div>
			</div>
		{/if}

		<div class="pt-4 border-t border-slate-100">
			{#if isMatchOver}
				<div
					class="bg-indigo-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-md"
				>
					<div class="flex flex-col">
						<p class="text-[10px] font-bold uppercase opacity-80 leading-none mb-1">Winner</p>
						<p class="text-sm font-black uppercase italic tracking-tight">
							{resultData.winner}
							{resultData.margin}
						</p>
					</div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="opacity-50"
						><circle cx="12" cy="8" r="7" /><polyline
							points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"
						/></svg
					>
				</div>
			{:else if isSecondInnings}
				<div class="flex justify-between items-center">
					<div class="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
						<p class="text-xs font-black text-amber-800 uppercase leading-none">
							Need {runsNeeded} <span class="text-[10px] font-medium text-amber-600">runs in</span>
							{maxBalls - match.total_balls}
							<span class="text-[10px] font-medium text-amber-600">balls</span>
						</p>
					</div>
					<div class="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
						<div
							class="h-full bg-indigo-500"
							style="width: {(match.total_balls / maxBalls) * 100}%"
						></div>
					</div>
				</div>
			{/if}
		</div>
	</a>
{/if}
