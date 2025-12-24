<script>
	import { getPlayerFirstAndLastName, getRole } from '$lib/utils';

	const { teamId, players, handleSubmit } = $props();

	// This array will preserve the exact order of clicks
	let xi = $state([]);

	const MAX_PLAYERS = 11;

	function togglePlayer(playerId) {
		const existingIndex = xi.findIndex((p) => p.id === playerId);

		if (existingIndex !== -1) {
			// REMOVE: Filter out the player and re-map to fix the order sequence
			const filtered = xi.filter((p) => p.id !== playerId);
			xi = filtered.map((p, index) => ({
				id: p.id,
				order: index + 1
			}));
		} else if (xi.length < MAX_PLAYERS) {
			// ADD: Push new object with the next order number
			xi = [...xi, { id: playerId, order: xi.length + 1 }];
		}
	}

	const getSelection = (id) => xi.find((p) => p.id === id);
</script>

<div class="bg-white p-4 rounded-xl shadow-lg">
	<h2 class="text-xl font-bold mb-4 border-b pb-2">
		Selected Players: {xi.length} / 11
	</h2>
	<div class="grid grid-cols-1 gap-2 mb-6">
		{#each players as player (player.id)}
			{@const selection = getSelection(player.id)}

			<button
				type="button"
				class="flex items-center justify-between p-3 rounded-lg border transition-all select-none w-full {selection
					? 'bg-blue-50 border-blue-500 shadow-md'
					: 'bg-gray-50 border-gray-200'}"
				onclick={() => togglePlayer(player.id)}
			>
				<div class="flex items-center gap-2">
					{#if selection}
						<span
							class="flex items-center justify-center bg-blue-600 text-white text-xs font-bold h-6 w-6 rounded-full"
						>
							{selection.order}
						</span>
					{/if}

					<img
						src={player.player_photo_url}
						alt={player.name}
						class="h-10 w-10 rounded-full border-2 border-gray-200 object-cover"
					/>
					<div class="flex flex-col items-start whitespace-nowrap overflow-hidden">
						<span
							class="text-sm font-semibold truncate {selection ? 'text-blue-800' : 'text-gray-800'}"
						>
							{getPlayerFirstAndLastName(player.name)}
						</span>
						<span
							class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800"
						>
							{getRole(player.role)}
						</span>
					</div>
				</div>

				<div class="text-xs font-medium">
					{#if selection}
						<span class="text-blue-600 uppercase">Selected</span>
					{:else}
						<span class="text-gray-400">Add</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<button
		onclick={() => handleSubmit(xi)}
		disabled={xi.length !== MAX_PLAYERS}
		class="w-full h-[50px] rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:bg-gray-300 disabled:text-gray-500"
	>
		{xi.length === MAX_PLAYERS ? 'Confirm Starting XI' : `Select ${MAX_PLAYERS - xi.length} more`}
	</button>
</div>
