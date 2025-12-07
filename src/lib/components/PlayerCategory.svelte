<script>
	import { startLoading, staticApiData, stopLoading } from '$lib/state/+state.svelte';
	import { hplFetch } from '$lib/utils/api';

	let { catId, playerId, isAdmin } = $props();
	let selectedCategory = $derived(catId);
	let isEditing = $state(false);

	const currentCategory = $derived(getPlayerCategory(selectedCategory));

	function getPlayerCategory(id) {
		return staticApiData.playerCategories.find((cat) => cat.id === id);
	}

	function getCategoryClasses(categoryKey) {
		// Use a switch or map to assign specific Tailwind classes based on the key
		switch (categoryKey) {
			case 'A':
				// High-tier: Use the vibrant Orange background
				return 'bg-[#FC814A] text-[#4D5382] ring-2 ring-[#FC814A]/50';
			case 'B':
				// Mid-high tier: Use the clean Sky Blue accent
				return 'bg-[#66C3FF] text-[#4D5382] ring-2 ring-[#66C3FF]/50';
			case 'C':
				// Mid-low tier: Use the Steel/Dark color with Cream text
				return 'bg-[#475B63] text-hpl-cream ring-2 ring-[#475B63]/50';
			case 'D':
				// Base tier: Use the Indigo/Primary dark color
				return 'bg-[#4D5382] text-hpl-cream ring-2 ring-[#4D5382]/50';
			default:
				// Default style for unassigned or unknown
				return 'bg-gray-200 text-gray-700';
		}
	}

	async function updatePlayerCategory() {
		try {
			startLoading('Updating Player...');
			const body = {
				category_id: selectedCategory
			};
			const updateResp = await hplFetch(fetch, `/players/${playerId}`, 'PUT', body);
			const updatedPlayerData = await playerResponse.json();
			alert(`Category successfully updated to ${updatedPlayerData.category.name}`);
		} catch (e) {
			alert(`Failed to update category. Details: ${e.message}`);
		} finally {
			stopLoading();
		}
	}
</script>

{#if currentCategory && !isEditing}
	<div class="flex gap-4">
		<span
			class="text-md rounded-sm px-2 py-[2px] font-semibold text-white {getCategoryClasses(
				currentCategory?.name
			)}">{currentCategory.name}</span
		>
	</div>
{:else if !currentCategory && !isAdmin}
	<span class="text-xl font-bold text-gray-500">-</span>
{:else}
	<select
		name="player-category"
		id="category"
		bind:value={selectedCategory}
		class="grow rounded-md border border-[#66C3FF] bg-[#FEFADC] px-1 py-1 text-sm text-[#4D5382] shadow-sm disabled:opacity-70"
		onchange={updatePlayerCategory}
	>
		<option value={catId} disabled>
			{selectedCategory ? 'Select Category' : 'Select Category'}
		</option>
		{#each staticApiData.playerCategories as cat (cat.id)}
			<option value={cat.id}>
				{cat.name} (₹{cat.base_price})
			</option>
		{/each}
	</select>
{/if}
