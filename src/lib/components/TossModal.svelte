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
			const { toss_winner, toss_decison } = await resp.json();
			if (toss_winner) {
				handleClose(toss_winner, toss_decison);
			}
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
	<div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
		<h2 class="text-2xl font-extrabold text-center mb-6">Match Toss</h2>
		<p class="font-semibold mb-3 text-gray-700">1. Whoe won the toss?</p>
		<div class="flex gap-4 mb-6">
			<label
				class="flex flex-col items-center p-3 border rounded-lg transition-all {tossWinnerId ===
				fixture.team_a
					? 'border-ble-600 bg-blue-50'
					: 'border-gray-500'}"
			>
				<input type="radio" bind:group={tossWinnerId} value={fixture.team_a} class="hidden" />
				<DisplayTeamLogoName teamId={fixture.team_a} />
			</label>
			<label
				class="flex flex-col items-center p-3 border rounded-lg transition-all {tossWinnerId ===
				fixture.team_b
					? 'border-ble-600 bg-blue-50'
					: 'border-gray-500'}"
			>
				<input type="radio" bind:group={tossWinnerId} value={fixture.team_b} class="hidden" />
				<DisplayTeamLogoName teamId={fixture.team_b} />
			</label>
		</div>
		<p class="font-semibold mb-3 text-gray-700">2. Toss decision?</p>
		<div class="flex gap-4 mb-8">
			<button
				class="flex-1 py-3 rounded-lg font-bold transition {decision === 'bat'
					? 'bg-green-600 text-white shadow-md'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				onclick={() => (decision = 'bat')}
			>
				Bat 🏏
			</button>
			<button
				class="flex-1 py-3 rounded-lg font-bold transition {decision === 'bowl'
					? 'bg-green-600 text-white shadow-md'
					: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				onclick={() => (decision = 'bowl')}
			>
				Bowl 🥎
			</button>
		</div>

		<div class="flex gap-3">
			<button
				class="flex-1 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
				onclick={() => {
					handleClose();
				}}>Cancel</button
			>
			<button
				onclick={handleRecordToss}
				disabled={!tossWinnerId || !decision}
				class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
			>
				Record Toss
			</button>
		</div>
	</div>
</div>
