<script>
	import { page } from '$app/state';
	import DisplayTeamLogoName from '$lib/components/DisplayTeamLogoName.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { getHeaderAuthorisation } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';

	const fixtureId = page.params.id;

	let matchData = $state(null);
	let selectedExtra = $state(null);
	let isWicketMode = $state(false);

	// Form Temporary States
	let wicketType = $state('caught');
	let whoGotOutId = $state('');
	let newBatsmanId = $state('');
	let newBowlerId = $state('');
	let runsAtWicket = $state(0);

	// derived data
	let match = $derived.by(() => matchData?.live_match);
	let battingLineUp = $derived.by(() => matchData?.batting_players);
	let bowlingLineUp = $derived.by(() => matchData?.bowling_players);
	let battingTeamId = $derived.by(() => matchData?.batting_team);
	let bowlingTeamId = $derived.by(() => matchData?.bowling_team);

	let striker = $derived.by(() => battingLineUp?.find((p) => p.player_id === match?.striker_id));
	let nonStriker = $derived.by(() =>
		battingLineUp?.find((p) => p.player_id === match?.non_striker_id)
	);
	let bowler = $derived.by(() =>
		bowlingLineUp?.find((p) => p.player_id === match?.current_bowler_id)
	);

	// modals
	let showWicketModal = $state(false);
	let showBowlerModal = $derived.by(() => (bowler ? false : true));

	async function getLiveMatchData() {
		try {
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

	onMount(() => {
		getLiveMatchData();
		const channel = supabase
			.channel(`score_${fixtureId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'live_matches',
					filter: `fixture_id=eq.${fixtureId}`
				},
				getLiveMatchData
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	});

	function toggleExtra(type) {
		if (selectedExtra === type) selectedExtra = null;
		else selectedExtra = type;
	}

	function toggleWicket() {
		isWicketMode = !isWicketMode;
	}

	function haptic() {
		if (navigator.vibrate) navigator.vibrate(40);
	}

	async function handleRun(runs) {
		haptic();
		if (isWicketMode) {
			whoGotOutId = match.striker_id;
			showWicketModal = true;
			return;
		}
		await submitBall(runs);
	}

	async function submitBall(runs, wicketData = null) {
		let extraRuns = 0;
		if (selectedExtra === 'wide' || selectedExtra === 'no_ball') extraRuns = 1;
		const body = {
			p_fixture_id: fixtureId,
			p_runs_scored: runs,
			p_extra_type: selectedExtra,
			p_extra_runs: extraRuns,
			p_is_wicket: !!wicketData,
			p_wicket_type: wicketData?.type ?? null,
			p_wicket_player_out_id: wicketData?.out_id ?? null,
			p_new_batsman_id: wicketData?.new_bat_id ?? null
		};
		const headers = getHeaderAuthorisation();
		const resp = await hplFetch(
			fetch,
			`/fixtures/live/match-lineups/${fixtureId}`,
			'POST',
			body,
			headers
		);
		if (resp.success) {
			// Reset local UI states
			selectedExtra = null;
			isWicketMode = false;
			showWicketModal = false;
		}
	}

	async function submitNewBowler() {
		if (!newBowlerId) return;
		await supabase
			.from('live_matches')
			.update({ current_bowler_id: newBowlerId })
			.eq('fixture_id', fixtureId);
		showBowlerModal = false;
	}

	let availableBatsmen = $derived.by(() => {
		return battingLineUp.filter(
			(p) => !p.is_out && p.player_id !== match?.striker_id && p.player_id !== match?.non_striker_id
		);
	});
</script>

{#if match}
	<div class="flex flex-col h-full w-full">
		<header
			class="bg-gradient-to-r from-slate-100 via-white to-slate-100 shadow-lg border-b border-slate-200"
		>
			<div class="max-w-7xl mx-auto px-4 py-3">
				<div class="flex items-center justify-between">
					<!-- Team -->
					<div class="flex items-center gap-3 text-black">
						<DisplayTeamLogoName teamId={match.batting_team_id} />
					</div>

					<!-- Score -->
					<div class="text-center text-black">
						<h1 class="text-5xl font-extrabold tracking-tight">
							{match.current_inning_runs}
							<span class="text-slate-500 text-3xl">/{match.current_inning_wickets}</span>
						</h1>
						<p class="text-xs uppercase tracking-widest text-slate-500 mt-1">Current Score</p>
					</div>

					<!-- Overs -->
					<div class="text-right text-black">
						<p class="text-2xl font-mono">
							{Math.floor(match.total_balls / 6)}.
							<span class="text-slate-500">{match.total_balls % 6}</span>
						</p>
						<p class="text-xs uppercase tracking-widest text-slate-500">Overs</p>
					</div>
				</div>
			</div>
		</header>

		<div class="grid grid-cols-2 bg-white border-b divide-x">
			<div class="p-3 {striker ? 'bg-blue-50' : ''}">
				<p class="text-[10px] font-bold text-slate-400 uppercase">Striker</p>
				<p class="font-bold truncate">{striker?.name ?? 'Loading...'}*</p>
			</div>
			<div class="p-3">
				<p class="text-[10px] font-bold text-slate-400 uppercase">Non-Striker</p>
				<p class="font-medium truncate text-slate-600">{nonStriker?.name ?? 'Loading...'}</p>
			</div>
		</div>

		<div class="bg-slate-800 text-indigo-100 px-4 py-2 text-xs flex justify-between items-center">
			<span>Bowler: <span class="font-bold text-white">{bowler?.name ?? ' - '}</span></span>
			<span class="opacity-60">Ball-by-Ball Admin</span>
		</div>

		<main class="flex-1 flex flex-col p-4 gap-4 justify-center">
			<div class="grid grid-cols-3 gap-3">
				{#each [0, 1, 2, 3, 4, 6] as run}
					<button
						onclick={() => handleRun(run)}
						class="h-20 bg-white rounded-2xl shadow-sm border border-slate-200
                               text-3xl font-black text-indigo-950 active:scale-95
                               active:bg-indigo-600 active:text-white transition-all duration-75"
					>
						{run}
					</button>
				{/each}
			</div>

			<div class="grid grid-cols-4 gap-2">
				{#each [['WD', 'wide'], ['NB', 'no_ball'], ['LB', 'leg_bye'], ['B', 'bye']] as [label, val]}
					<button
						onclick={() => toggleExtra(val)}
						class="py-4 rounded-xl text-xs font-black border-2 transition-all
                        {selectedExtra === val
							? 'bg-amber-400 border-amber-600 text-amber-950 shadow-inner'
							: 'bg-white border-slate-200 text-slate-500'}"
					>
						{label}
					</button>
				{/each}
			</div>

			<button
				onclick={() => {
					haptic();
					isWicketMode = !isWicketMode;
				}}
				class="py-5 rounded-2xl font-black tracking-widest transition-all border-2
                {isWicketMode
					? 'bg-red-600 border-red-800 text-white shadow-lg scale-105'
					: 'bg-red-50 border-red-100 text-red-600'}"
			>
				{isWicketMode ? 'CANCEL WICKET' : 'WICKET'}
			</button>
		</main>
	</div>
{/if}
{#if showBowlerModal}
	<div
		class="fixed inset-0 z-[60] bg-indigo-950/95 flex items-center justify-center p-6 backdrop-blur-md"
	>
		<div class="bg-white rounded-xl p-8 w-full max-w-sm text-center shadow-2xl">
			<div
				class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auot mb-4"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
				>
			</div>
			<h2 class="text-2xl font-black text-indigo-950 mb-1">Over Complete</h2>
			<p class="text-slate-500 text-sm mb-8 leading-tight">Select a bowler for the next over.</p>
			<select
				bind:value={newBowlerId}
				class="w-full p-5 bg-slate-100 rounded-2xl border-none font-black text-lg text-indigo-900 mb-8 appearance-none"
			>
				<option value="">Choose Bowler</option>
				{#each bowlingLineUp as bowler}
					<option value={bowler.player_id}>{bowler.name}</option>
				{/each}
			</select>
			<button
				onclick={submitNewBowler}
				class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-transform disabled:opacity-20"
				disabled={!newBowlerId}
			>
				Start Next Over
			</button>
		</div>
	</div>
{/if}

{#if showWicketModal}
	<div
		class="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6"
	>
		<div class="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
			<h2 class="text-xl font-black text-red-600 uppercase tracking-light">Record Wicket</h2>
			<div class="space-y-4">
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Dismissed Player</label
					>
					<select
						bind:value={whoGotOutId}
						class="w-full p-4 bg-slate-100 rounded-xl border-none font-bold focus:ring-2 focus:ring-red-500"
					>
						<option value={match.striker_id}>Striker ({striker?.name})</option>
						<option value={match.non_striker_id}>Non-Striker ({nonStriker?.name})</option>
					</select>
				</div>
				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Wicket Type</label>
					<select
						bind:value={wicketType}
						class="w-full p-4 bg-slate-100 rounded-xl border-none font-bold"
					>
						<option value="caught">Caught</option>
						<option value="bowled">Bowled</option>
						<option value="run_out">Run Out</option>
						<option value="lbw">LBW</option>
						<option value="stumped">Stumped</option>
					</select>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Incoming Batsman</label
					>
					<select
						bind:value={newBatsmanId}
						class="w-full p-4 bg-slate-100 rounded-xl border-none font-bold"
					>
						<option value="">Select New Batsman</option>
						{#each availableBatsmen as p}
							<option value={p.player_id}>{p.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Runs</label>
					<select
						bind:value={runsAtWicket}
						class="w-full p-4 bg-slate-100 rounded-xl border-none font-bold"
					>
						<option value="">Select Runs</option>
						{#each [0, 1, 2, 3, 4, 5, 6] as p}
							<option value={p}>{p}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex flex-col gap-2 mt-2">
				<button
					onclick={() =>
						submitBall(runsAtWicket, {
							type: wicketType,
							out_id: whoGotOutId,
							new_bat_id: newBatsmanId
						})}
					class="bg-red-600 text-white py-4 rounded-xl font-black disabled:opacity-30 shadow-lg shadow-red-200"
					disabled={!newBatsmanId}
				>
					CONFIRM OUT
				</button>
				<button
					onclick={() => (showWicketModal = false)}
					class="text-slate-400 text-sm font-bold py-2">Go Back</button
				>
			</div>
		</div>
	</div>
{/if}
