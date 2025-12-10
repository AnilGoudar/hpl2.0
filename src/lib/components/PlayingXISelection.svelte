<script>
	import { getRole } from '$lib/utils';

	const { teamId, players, handleSubmit } = $props();
	let xi = $state([]);
	let selectedPlayerIds = $derived(new Set(xi));
	const MAX_PLAYERS = 11;
	function togglePlayer(playerId) {
		if (selectedPlayerIds.has(playerId)) {
			// Remove player (tracked array mutation)
			xi = xi.filter((id) => id !== playerId);
		} else if (xi.length < 11) {
			// Add player (tracked array mutation)
			xi = [...xi, playerId];
		} else {
			alert('You can select a maximum of 11 players');
		}
	}
</script>

<div class="bg-white p-4 rounded-xl shadow-lg">
	<h2 class="text-xl font-bold mb-4 border-b pb-2">
		Selected Players: {selectedPlayerIds.size} / 11
	</h2>
	<div class="grid grid-cols-1 gap-2 mb-6">
		{#each players as player (player.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="flex items-center justify-between p-3 rounded-lg border transition-all select-none {selectedPlayerIds.has(
					player.id
				)
					? 'bg-blue-50 border-blue-500 shadow-md'
					: 'bg-gray-50 border-gray-200'}"
				onclick={() => togglePlayer(player.id)}
			>
				<div class="flex items-center gap-2">
					<img
						src={player.player_photo_url}
						alt={name}
						class="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
					/>
					<div class="flex flex-col gap-2 whitespace-nowrap overflow-hidden max-w-[80%]">
						<span
							class="text-lg font-semibold mr-2 truncate {selectedPlayerIds.has(player.id)
								? 'text-blue-800'
								: 'text-gray-800'}">{player.name}</span
						>
						<span
							class="w-fit text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800"
						>
							{getRole(player.role)}
						</span>
					</div>
				</div>

				<div class="text-xs text-gray-500">
					{#if selectedPlayerIds.has(player.id)}
						✅ Selected
					{:else}
						Tap to Select
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<button
		onclick={() => {
			handleSubmit([...selectedPlayerIds]);
		}}
		disabled={selectedPlayerIds.size !== MAX_PLAYERS}
		class="flex-1 w-full h-[40px] rounded-lg flex items-center justify-center bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
	>
		{selectedPlayerIds.size === MAX_PLAYERS
			? 'Confirm & Continue'
			: `Select ${MAX_PLAYERS - selectedPlayerIds.size} more`}
	</button>
</div>
