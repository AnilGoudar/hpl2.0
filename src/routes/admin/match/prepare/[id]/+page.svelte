<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DisplayTeamLogoName from '$lib/components/DisplayTeamLogoName.svelte';
	import PlayingXISelection from '$lib/components/PlayingXISelection.svelte';
	import TossModal from '$lib/components/TossModal.svelte';
	import { startLoading, stopLoading } from '$lib/state/+state.svelte';
	import { getHeaderAuthorisation } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';

	const fixtureId = page.params.id;
	let currentFixture = $state(null);
	let teamAPlayers = $state([]);
	let teamBPlayers = $state([]);
	let playingXITeamA = $state([]);
	let playingXITeamB = $state([]);

	let currentStep = $state(1);
	// toss state
	let showTossModal = $state(false);
	let tossWinnerId = $state(null);
	let tossDecision = $state(null);
	let fixtureStatus = $state(null);

	onMount(async () => {
		try {
			startLoading('Fetching players for the teams...');
			const resp = await hplFetch(fetch, `/fixtures/${fixtureId}`, 'GET');
			const { fixture, teamAPlayers: teamA, teamBPlayers: teamB } = await resp.json();
			currentFixture = fixture;
			teamAPlayers = teamA;
			teamBPlayers = teamB;
			tossWinnerId = fixture?.toss_winner;
			tossDecision = fixture?.toss_decision;
			if (fixture?.toss_winner) {
				currentStep = 3;
			}
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	});

	async function handleTeamASubmitted(xi) {
		if (xi.length !== 11) {
			return alert('Please select exactly 11 players');
		}
		playingXITeamA = [...xi];
		//  save team to database
		try {
			startLoading('Saving fixture line for the team...');
			const playerIds = xi.map((player) => player);
			const body = playerIds.map((id, index) => ({
				player_id: id,
				team_id: currentFixture?.team_a,
				fixture_id: fixtureId,
				batting_order: index + 1
			}));
			const resp = await hplFetch(fetch, `/fixtures/lineups/${fixtureId}`, 'POST', body);
			if (resp.ok) {
				currentStep = 2;
			}
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}

	async function handleTeamBSubmitted(xi) {
		if (xi.length !== 11) return alert('Please select exactly 11 players');
		playingXITeamB = [...xi];
		try {
			startLoading('Saving fixture line for the team...');
			const playerIds = xi.map((player) => player);
			const body = playerIds.map((id, index) => ({
				player_id: id,
				team_id: currentFixture?.team_b,
				fixture_id: fixtureId,
				batting_order: index + 1
			}));
			const resp = await hplFetch(fetch, `/fixtures/lineups/${fixtureId}`, 'POST', body);
			if (resp.ok) {
				currentStep = 3;
			}
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}

	function handleTossModalClose(tossWinner, decision) {
		if (tossWinner) {
			tossWinnerId = tossWinner;
			tossDecision = decision;
		}
		showTossModal = false;
	}

	function getClassesForStepIndication(step) {
		let defaultClasses = 'flex items-center gap-2 flex-1 text-center border-b-2 py-2';
		if (step === currentStep) {
			defaultClasses += ' border-blue-600 text-blue-600 font-bold';
		} else {
			defaultClasses += ' border-gray-300 text-gray-500';
		}
		return defaultClasses;
	}

	async function handleStartMatch() {
		try {
			startLoading('Staring the match...');
			const body = {
				fixture_id: fixtureId
			};
			const headers = getHeaderAuthorisation();
			const resp = await hplFetch(fetch, '/fixtures/start', 'POST', body, headers);
			if (!resp.ok) {
				const errorData = await resp.json();
				throw new Error(errorData.message || 'Match start failed on the server.');
			}
			alert('Match started successfully! Going Live.');
			//
			goto(`/admin/match/score/${fixtureId}`);
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}
</script>

<div class="bg-gray-50 min-h-screen">
	{#if !currentFixture}
		<div class="text-center text-gray-500">Loading fixture details...</div>
	{:else}
		<h1 class="flex gap-2 items-center text-xl font-bold mb-6 text-gray-800 border-b pb-2">
			Match:
			<DisplayTeamLogoName teamId={currentFixture.team_a} />
			vs
			<DisplayTeamLogoName teamId={currentFixture.team_b} />
		</h1>

		<!-- current step indicator -->
		<div class="flex justify-between items-center mb-6">
			{#if currentStep === 1}
				<div class={getClassesForStepIndication(1)}>
					<DisplayTeamLogoName teamId={currentFixture.team_a} /> Playing XI
				</div>
			{:else if currentStep === 2}
				<div class={getClassesForStepIndication(2)}>
					<DisplayTeamLogoName teamId={currentFixture.team_b} /> Playing XI
				</div>
			{:else}
				<div class={getClassesForStepIndication(3)}>Toss and Start</div>
			{/if}
		</div>

		{#if currentStep === 1}
			<PlayingXISelection
				teamId={currentFixture.team_a}
				players={teamAPlayers}
				handleSubmit={handleTeamASubmitted}
			/>
		{/if}

		{#if currentStep === 2}
			<PlayingXISelection
				teamId={currentFixture.team_b}
				players={teamBPlayers}
				handleSubmit={handleTeamBSubmitted}
			/>
		{/if}

		{#if currentStep === 3}
			<div class="p-6 bg-white shadow-lg rounded-xl">
				{#if tossWinnerId}
					<div class="mt-8 pt-6 border-t border-gray-300">
						<!-- Title -->
						<div class="text-center mb-6">
							<p class="text-sm font-semibold text-gray-600 tracking-wide">TOSS RECORDED</p>
						</div>

						<!-- Winner + Decision -->
						<div class="flex flex-col items-center gap-4 mb-6 text-gray-900">
							<!-- Winner -->
							<div class="flex items-center gap-2 text-xl font-bold">
								<DisplayTeamLogoName teamId={tossWinnerId} />
							</div>

							<!-- Decision -->
							<div class="flex items-center gap-2 text-lg font-semibold">
								<span>chose to</span>

								<span
									class="px-3 py-1 rounded-full text-white text-sm font-black uppercase tracking-wide
					{tossDecision === 'bat' ? 'bg-orange-600 shadow-md' : 'bg-blue-600 shadow-md'}"
								>
									{tossDecision}
								</span>
							</div>
						</div>

						<!-- Action Button -->
						<button
							onclick={handleStartMatch}
							class="w-full py-4 rounded-xl text-lg font-black text-white
			bg-green-600 hover:bg-green-700 active:bg-green-800
			transition shadow-lg shadow-green-900/20"
						>
							GO LIVE 🔴
						</button>
					</div>
				{:else}
					<h2 class="text-2xl font-bold mb-4 text-center">Final Step: Toss</h2>
					<button
						onclick={() => (showTossModal = true)}
						class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
					>
						Record Toss
					</button>
				{/if}
			</div>
			{#if showTossModal}
				<TossModal {fixtureId} fixture={currentFixture} handleClose={handleTossModalClose} />
			{/if}
		{/if}
	{/if}
</div>
