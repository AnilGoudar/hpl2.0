<script>
	import { page } from '$app/state';
	import DisplayTeamLogoName from '$lib/components/DisplayTeamLogoName.svelte';
	import { loadingState, startLoading, stopLoading } from '$lib/state/+state.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { displayTeamName } from '$lib/utils';
	import { onMount } from 'svelte';

	let { data } = $props();
	const fixture_id = page.params.id;

	// --- DATA STATE (Fetched via RPC) ---
	let match = $state(null);
	let battingPlayers = $state(null);
	let bowlingPlayers = $state(null);
	let battingTeam = $state(null);
	let bowlingTeam = $state(null);

	// --- DERIVED STATE (for UI display/logic) ---
	let striker = $derived.by(() => battingPlayers?.find((p) => p.player_id === match?.striker_id));
	let nonStriker = $derived.by(() =>
		battingPlayers?.find((p) => p.player_id === match?.non_striker_id)
	);
	let bowler = $derived.by(() =>
		bowlingPlayers?.find((p) => p.player_id === match?.current_bowler_id)
	);
	let currentOverDisplay = $derived.by(() => {
		const totalBalls = match?.total_balls ?? 0;
		return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
	});
	let availableBatsmen = $derived.by(() => {
		if (!match) return [];
		// Filter players who are NOT out and NOT currently batting
		const excludedIds = new Set([match.striker_id, match.non_striker_id]);
		return battingPlayers.filter((p) => !p.is_out && !excludedIds.has(p.player_id));
	});

	// --- SCORING STATE ---
	let selectedExtra = $state(null);
	let isWicketMode = $state(false);

	// --- MODAL STATE ---
	let showWicketModal = $state(false);
	let showBowlerModal = $state(false);

	// --- FORM SELECTIONS ---
	let wicketType = $state('caught');
	let whoGotOut = $state('');
	let newBatsmanId = $state('');
	let newBowlerId = $state('');

	const getPlayerInfo = (playerId, teamArray) => {
		if (!playerId || !teamArray) return null;
		return teamArray.find((p) => p.player_id === playerId);
	};

	function calculateAvailableBatsmen() {
		if (!match || !battingPlayers) return [];

		const currentOutPlayers = battingPlayers.filter((p) => p.is_out).map((p) => p.player_id);

		return battingPlayers.filter((p) => {
			// Must be in the lineup
			// Must NOT be out
			if (currentOutPlayers.includes(p.player_id)) return false;
			// Must NOT be the current striker or non-striker
			if (p.player_id === match.striker_id || p.player_id === match.non_striker_id) return false;

			return true;
		});
	}

	// --- 1. DATA FETCHING ---
	async function loadMatchData() {
		if (loadingState.isLoading) return;
		startLoading('Fetching match data...');

		const { data: rpcData, error: rpcError } = await supabase.rpc('get_live_match_lineups', {
			p_fixture_id: fixture_id
		});

		if (rpcError) {
			console.error('Error fetching live match data:', rpcError);
			alert('Error loading match: ' + rpcError.message);
		} else {
			bowlingTeam = rpcData.bowling_team;
			battingTeam = rpcData.batting_team;
			battingPlayers = rpcData.batting_players;
			bowlingPlayers = rpcData.bowling_players;
			match = rpcData.live_match;
			// Critical check: Open Bowler modal if required
			if (!rpcData.live_match.current_bowler_id) {
				showBowlerModal = true;
				// Pre-select the first player in the bowling list as a suggestion
				newBowlerId = rpcData.bowling_players[0]?.player_id || '';
			}
		}
		stopLoading();
	}

	onMount(() => {
		loadMatchData();
		const channel = supabase
			.channel('live_score')
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'live_matches',
					filter: `fixture_id=eq.${fixture_id}`
				},
				() => loadMatchData()
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

	async function handleRunClick(run) {
		if (loadingState.isLoading) return;

		if (isWicketMode) {
			// Set default selections for modal
			whoGotOut = match?.striker_id;
			newBatsmanId = availableBatsmen[0]?.player_id || '';

			showWicketModal = true;
			return;
		}
		submitBall(run);
	}

	async function submitBall(run_val, wicket_data = null) {
		try {
			// startLoading('Updating score...');
			let extra_runs = 0;
			let runs_off_bat = run_val;
			let extra_type = selectedExtra;

			if (selectedExtra === 'wide' || selectedExtra === 'no_ball') {
				extra_runs = 1 + run_val;
				if (selectedExtra === 'wide') runs_off_bat = 0;
				if (selectedExtra === 'no_ball') runs_off_bat = run_val;
			}

			const payload = {
				p_fixture_id: fixture_id,
				p_runs_scored: runs_off_bat,
				p_extra_type: extra_type,
				p_extra_runs: extra_runs,
				p_is_wicket: !!wicket_data,
				p_wicket_type: wicket_data?.type || null,
				p_wicket_player_out_id: wicket_data?.out_id || null,
				p_new_batsman_id: wicket_data?.new_bat_id || null
			};

			// NOTE: The RPC name must match what you have in the DB.
			const { error } = await supabase.rpc('record_ball', payload);

			if (error) {
				alert('Scoring Error: ' + error.message);
			} else {
				// Reset UI State
				selectedExtra = null;
				isWicketMode = false;
				showWicketModal = false;
			}
		} catch (error) {
			alert('Client Error: ' + error.message);
		} finally {
			stopLoading();
		}
	}

	// Handle New Bowler Submission
	async function submitNewBowler() {
		if (!newBowlerId) return;
		try {
			await supabase
				.from('live_matches')
				.update({ current_bowler_id: newBowlerId })
				.eq('fixture_id', fixture_id);
			showBowlerModal = false;
			// The realtime listener will call loadMatchData() to refresh state
		} catch (e) {
			alert('Error setting bowler: ' + e.message);
		}
	}
</script>

{#if !match}
	<div class="flex items-center justify-center h-screen bg-gray-100">
		<p class="text-red-600 font-semibold text-lg">Match Not Found or Not Live.</p>
	</div>
{:else}
	<div class="min-h-screen bg-gray-100 w-full">
		<header class="sticky top-0 z-40 bg-white shadow-md px-4 py-3">
			<div class="flex items-center justify-between border-b pb-2">
				<div class="text-xl font-extrabold flex gap-4 items-center">
					<DisplayTeamLogoName teamId={match.batting_team_id} />
					{match.current_inning_runs ?? 0}/{match.current_inning_wickets ?? 0}
					<span class="text-xs font-bold text-red-600 animate-pulse">LIVE</span>
				</div>
				<div class="text-sm text-gray-600">
					{currentOverDisplay} Overs
				</div>
			</div>
			<div class="mt-1 text-sm text-gray-700">Last ball: Pending Log Query</div>
		</header>

		<section class="bg-white mt-3 rounded-xl shadow p-4">
			<div class="grid grid-cols-2 gap-3 text-sm">
				<div>
					<p class="font-semibold">Striker</p>
					<p class="font-bold">{striker?.name ?? 'N/A'}</p>
				</div>
				<div>
					<p class="font-semibold">Non-Striker</p>
					<p>{nonStriker?.name ?? 'N/A'}</p>
				</div>
			</div>
			<div class="mt-2">
				<p class="font-semibold">Bowler</p>
				<p class="font-bold">{bowler?.name ?? 'N/A'}</p>
			</div>
		</section>

		<section class="mt-4 mx-3">
			<div class="grid grid-cols-6 gap-3">
				{#each [0, 1, 2, 3, 4, 6] as run}
					<button
						onclick={() => handleRunClick(run)}
						class="py-4 bg-white rounded-xl shadow-lg font-bold text-2xl active:scale-95 hover:bg-blue-50"
						disabled={loadingState.isLoading}
					>
						{run}
					</button>
				{/each}
			</div>
		</section>

		<section class="mt-4 mx-3 grid grid-cols-3 gap-3">
			<button
				class="py-3 rounded-xl font-bold transition-all border-2 {selectedExtra === 'wide'
					? 'bg-yellow-400 border-yellow-600'
					: 'bg-yellow-100 border-transparent'}"
				onclick={() => toggleExtra('wide')}
				disabled={loadingState.isLoading}
			>
				Wide
			</button>
			<button
				class="py-3 rounded-xl font-bold transition-all border-2 {selectedExtra === 'no_ball'
					? 'bg-yellow-400 border-yellow-600'
					: 'bg-yellow-100 border-transparent'}"
				onclick={() => toggleExtra('no_ball')}
				disabled={loadingState.isLoading}
			>
				No-ball
			</button>
			<button
				class="py-3 rounded-xl font-bold text-red-700 transition-all border-2 {isWicketMode
					? 'bg-red-500 text-white border-red-700'
					: 'bg-red-100 border-transparent'}"
				onclick={toggleWicket}
				disabled={loadingState.isLoading}
			>
				Wicket
			</button>
		</section>

		<section class="bg-white mt-4 mx-3 rounded-xl shadow p-4">
			<p class="font-bold mb-2">Current Over</p>
			<div class="flex gap-2 text-sm">
				<span class="text-gray-500">History not implemented yet...</span>
			</div>
		</section>
	</div>
	{#if showWicketModal}
		<div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-xl p-6 w-full max-w-sm">
				<h2 class="text-xl font-bold text-red-600 mb-4">Wicket Details</h2>

				<label class="block text-sm font-bold mb-1">Who is out?</label>
				<select bind:value={whoGotOut} class="w-full p-2 border rounded mb-3">
					<option value={match.striker_id}>Striker ({striker.name})</option>
					<option value={match.non_striker_id}>Non-Striker ({nonStriker.name})</option>
				</select>

				<label class="block text-sm font-bold mb-1">How?</label>
				<select bind:value={wicketType} class="w-full p-2 border rounded mb-3">
					<option value="caught">Caught</option>
					<option value="bowled">Bowled</option>
					<option value="lbw">LBW</option>
					<option value="run_out">Run Out</option>
					<option value="stumped">Stumped</option>
				</select>

				<label class="block text-sm font-bold mb-1">New Batsman</label>
				<select bind:value={newBatsmanId} class="w-full p-2 border rounded mb-6">
					{#each availableBatsmen as p}
						<option value={p.player_id}>{p.name}</option>
					{/each}
				</select>

				<button
					onclick={() =>
						submitBall(0, { type: wicketType, out_id: whoGotOut, new_bat_id: newBatsmanId })}
					class="w-full bg-red-600 text-white py-3 rounded-lg font-bold"
					disabled={!newBatsmanId}
				>
					Confirm Wicket
				</button>
				<button onclick={() => (showWicketModal = false)} class="w-full mt-2 text-gray-500 py-2"
					>Cancel</button
				>
			</div>
		</div>
	{/if}

	{#if showBowlerModal}
		<div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-xl p-6 w-full max-w-sm">
				<h2 class="text-xl font-bold text-blue-600 mb-2">Over Complete!</h2>
				<p class="mb-4 text-gray-600">Select the next bowler.</p>

				<select bind:value={newBowlerId} class="w-full p-3 border rounded mb-6">
					<option value="" disabled selected>Select Bowler</option>
					{#each bowlingPlayers as p}
						<option value={p.player_id}>{p.name}</option>
					{/each}
				</select>

				<button
					disabled={!newBowlerId}
					onclick={submitNewBowler}
					class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
				>
					Start Next Over
				</button>
			</div>
		</div>
	{/if}
{/if}
