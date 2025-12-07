<script>
	import { startLoading, staticApiData, stopLoading } from '$lib/state/+state.svelte';
	import { hplFetch } from '$lib/utils/api';

	let { teamId, playerId, isAdmin } = $props();
	let selectedTeam = $derived(teamId);
	let isEditing = $state(false);
	const currentTeam = $derived(getPlayerTeam(selectedTeam));

	function getPlayerTeam(id) {
		return staticApiData.teams.find((team) => team.id === id);
	}

	async function updatePlayerTeam() {
		try {
			startLoading('Updating Player...');
			const body = {
				team_id: selectedTeam
			};
			const updateResp = await hplFetch(fetch, `/players/${playerId}`, 'PUT', body);
			const updatedPlayerData = await playerResponse.json();
			alert(`Team successfully updated to ${updatedPlayerData.team.name}`);
		} catch (e) {
			alert(`Failed to update team. Details: ${e.message}`);
		} finally {
			stopLoading();
		}
	}
</script>

{#if currentTeam && !isEditing}
	<div class="flex items-center gap-2">
		{#if currentTeam.logo_url}
			<img
				src={currentTeam.logo_url}
				alt={`${currentTeam.name} Logo`}
				class="h-6 w-6 rounded-full border border-gray-300 object-contain"
			/>
		{/if}
		<span class="text-md truncate overflow-hidden font-semibold whitespace-nowrap text-gray-800">
			{currentTeam.name}
		</span>
	</div>
{:else if !currentTeam && !isAdmin}
	<span class="text-xl font-bold text-gray-500">-</span>
{:else}
	<select
		name="player-team"
		id="team"
		bind:value={selectedTeam}
		class="rounded-md border border-[#66C3FF] bg-[#FEFADC] px-3 py-1 text-sm text-[#4D5382] shadow-sm disabled:opacity-70"
		onchange={updatePlayerTeam}
	>
		<option value={teamId || null} disabled>
			{teamId ? 'Select New Team' : 'Select Team'}
		</option>

		{#each staticApiData.teams as team (team.id)}
			<option value={team.id}>
				{team.name}
			</option>
		{/each}
	</select>

	{#if teamId}
		<button
			onclick={() => {
				selectedTeam = teamId;
				isEditing = false;
			}}
			class="ml-2 rounded-lg bg-red-500 px-2 py-[2px] text-xs text-white transition hover:bg-red-600"
			title="Cancel"
		>
			Cancel
		</button>
	{/if}
{/if}
