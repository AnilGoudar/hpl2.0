<script>
	let { isAdmin, playerId, soldPrice } = $props();
	let admin = $derived(isAdmin);
	let price = $derived(soldPrice);

	let newSoldPrice = $derived(soldPrice || '');
	let isEditing = $state(false);

	async function updateSoldPrice() {
		const priceValue = parseFloat(newSoldPrice);
		if (isNaN(priceValue) || priceValue <= 0) {
			alert('Please enter a valid sold price greater than zero.');
			return;
		}
		try {
			startLoading('Updating Player...');
			const body = {
				sold_price: priceValue,
				is_sold: true
			};
			const updateResp = await hplFetch(fetch, `/players/${playerId}`, 'PUT', body);
			const updatedPlayerData = await playerResponse.json();
			alert(`Sold Price successfully updated to ${updatedPlayerData.sold_price}`);
		} catch (e) {
			alert(`Failed to update Sold Price. Details: ${e.message}`);
		} finally {
			stopLoading();
		}
	}
</script>

{#if price}
	<span class="text-lg font-bold text-green-700">
		₹{price}
	</span>
{:else if !admin}
	<span class="text-lg font-bold text-gray-400">-</span>
{:else if admin && !isEditing}
	<button
		onclick={() => (isEditing = true)}
		class="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-indigo-700"
	>
		Set Amount
	</button>
{:else if admin && isEditing}
	<div class="flex grow items-center gap-2">
		<input
			type="number"
			bind:value={newSoldPrice}
			placeholder="Price"
			class="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-70"
		/>
		<button
			onclick={updateSoldPrice}
			class="rounded-lg bg-green-500 px-3 py-1 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
		>
			Save
		</button>
		<button
			onclick={() => {
				isEditing = false;
				newSoldPrice = soldPrice || '';
			}}
			class="rounded-lg bg-gray-400 px-3 py-1 text-sm font-semibold text-white transition hover:bg-gray-500 disabled:opacity-50"
		>
			Cancel
		</button>
	</div>
{/if}
