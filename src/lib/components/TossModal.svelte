<script>
	import { startLoading, staticApiData, stopLoading } from '$lib/state/+state.svelte';
	import { hplFetch } from '$lib/utils/api';
	import DisplayTeamLogoName from './DisplayTeamLogoName.svelte';

	const { fixtureId, fixture, handleClose = () => {} } = $props();

	let tossWinnerId = $state('');
	let decision = $state('');

	async function handleRecordToss() {
		if (!tossWinnerId || !decision) {
			alert('Select both toss winner and their decision');
		}
		try {
			startLoading('Updating toss...');
			const resp = await hplFetch(fetch, `/fixtures/${fixtureId}`, 'PUT', {
				toss_winner: tossWinnerId,
				toss_decision: decision
			});
			const { toss_winner, toss_decision } = await resp.json();
			if (toss_winner) {
				handleClose(toss_winner, toss_decision);
			}
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}
</script>

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
	<div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
		<h2 class="text-3xl font-extrabold text-center mb-6 text-gray-900">Match Toss</h2>

		<!-- Toss Winner -->
		<p class="font-semibold mb-3 text-gray-800">1. Who won the toss?</p>
		<div class="grid grid-cols-2 gap-4 mb-6">
			<label
				class="cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
					{tossWinnerId === fixture.team_a
					? 'border-blue-600 bg-blue-50 shadow'
					: 'border-gray-300 hover:border-gray-500'}"
			>
				<input type="radio" bind:group={tossWinnerId} value={fixture.team_a} class="hidden" />
				<DisplayTeamLogoName teamId={fixture.team_a} />
			</label>

			<label
				class="cursor-pointer p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
					{tossWinnerId === fixture.team_b
					? 'border-blue-600 bg-blue-50 shadow'
					: 'border-gray-300 hover:border-gray-500'}"
			>
				<input type="radio" bind:group={tossWinnerId} value={fixture.team_b} class="hidden" />
				<DisplayTeamLogoName teamId={fixture.team_b} logoSize={20} />
			</label>
		</div>

		<!-- Toss Decision -->
		<p class="font-semibold mb-3 text-gray-800">2. What did they choose?</p>
		<div class="grid grid-cols-2 gap-4 mb-8">
			<button
				class="py-3 rounded-xl font-bold transition-all border
					{decision === 'bat'
					? 'bg-green-600 text-white shadow border-green-700'
					: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'}"
				onclick={() => (decision = 'bat')}
			>
				Bat 🏏
			</button>

			<button
				class="py-3 rounded-xl font-bold transition-all border
					{decision === 'bowl'
					? 'bg-green-600 text-white shadow border-green-700'
					: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'}"
				onclick={() => (decision = 'bowl')}
			>
				Bowl 🥎
			</button>
		</div>

		<!-- Buttons -->
		<div class="flex gap-4">
			<button
				class="flex-1 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 font-semibold"
				onclick={() => handleClose()}
			>
				Cancel
			</button>

			<button
				onclick={handleRecordToss}
				disabled={!tossWinnerId || !decision}
				class="flex-1 py-3 rounded-xl font-bold text-white transition
					{!tossWinnerId || !decision ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}"
			>
				Record Toss
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	.animate-fadeIn {
		animation: fadeIn 0.25s ease-out;
	}
</style>
