<script>
	import { goto } from '$app/navigation';

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
				onclick={() => goto('/players/register')}
				class="border border-blue-500 rounded-full px-4 py-1 shadow">Register</button
			>
		</div>
	</div>
{/if}
