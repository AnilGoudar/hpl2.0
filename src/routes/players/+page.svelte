<script>
	import { goto } from '$app/navigation';
	import PlayerCard from '$lib/components/PlayerCard.svelte';

	export let data;
	const { players, error } = data;
</script>

{#if error}
	<div class="text-orange-900 text-center">OOPS! Error in fetching Players</div>
{:else}
	<div class="mt-2 w-full">
		<div class="flex justify-between items-center border-b-1 border-gray-900 pb-2">
			<h2 class="text-2xl">All Players ({players.length})</h2>
			<button
				onclick={() => (window.location.href = '/players/register')}
				class="border border-blue-500 rounded-full px-4 py-1 shadow">Register</button
			>
		</div>
	</div>
	{#if players.length === 0}
		<p class="text-center text-gray-500">No players registered yet.</p>
	{:else}
		<div class="w-full grid grid-cols-1 gap-4">
			{#each players as player}
				<PlayerCard {player} />
			{/each}
		</div>
	{/if}
{/if}
