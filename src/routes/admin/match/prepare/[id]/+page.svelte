<script>
	import { page } from '$app/state';
	import DisplayTeamLogoName from '$lib/components/DisplayTeamLogoName.svelte';
	import PlayingXISelection from '$lib/components/PlayingXISelection.svelte';
	import TossModal from '$lib/components/TossModal.svelte';
	import { startLoading, stopLoading } from '$lib/state/+state.svelte';
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

	onMount(async () => {
		try {
			startLoading('Fetching players for the teams...');
			const resp = await hplFetch(fetch, `/fixtures/${fixtureId}`, 'GET');
			const { fixture, teamAPlayers: teamA, teamBPlayers: teamB } = await resp.json();
			currentFixture = fixture;
			teamAPlayers = teamA;
			teamBPlayers = teamB;
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	});

	function handleTeamASubmitted(xi) {
		if (xi.length !== 11) {
			return alert('Please select exactly 11 players');
		}
		playingXITeamA = [...xi];
		currentStep = 2;
	}

	function handleTeamBSubmitted(xi) {
		if (xi.length !== 11) return alert('Please select exactly 11 players');
		playingXITeamB = [...xi];
		currentStep = 3;
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

	async function handleStartMatch() {}
</script>

<div class="bg-gray-50 min-h-screen">
	{#if !currentFixture}
		<div class="text-center text-gray-500">Loading fixture details...</div>
	{:else}
		<h1 class="flex gap-2 items-center text-xl font-bold mb-6 text-gray-800 border-b pb-2">
			Match Prep:
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
					<div class="mt-8 pt-4 border-t">
						<p class="text-2xl font-bold mb-4 text-center">
							Toss Recorded: <DisplayTeamLogoName teamId={tossWinnerId} /> chose to {tossDecision}
						</p>
						<button
							onclick={handleStartMatch}
							class="w-full py-4 bg-green-600 text-white font-black text-xl rounded-lg hover:bg-green-700 transition shadow-xl shadow-green-900/30"
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
