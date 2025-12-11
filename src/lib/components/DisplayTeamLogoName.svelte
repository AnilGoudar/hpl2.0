<script>
	import { staticApiData } from '$lib/state/+state.svelte';
	import { displayTeamName } from '$lib/utils';

	const { teamId, showLogo = true, logoSize = 30 } = $props();
	const allTeams = $derived.by(() => staticApiData?.teams);

	const team = $derived.by(() => {
		const team = allTeams.find((t) => t.id === teamId);
		return team;
	});
</script>

{#if !team}
	<div class="text"></div>
{:else}
	<div class="flex items-center gap-2">
		{#if showLogo}
			<img
				class="rounded-full object-cover shadow-lg"
				src={team.logo_url}
				alt="{team.name}team"
				style="height: {logoSize}px; width: {logoSize}px;"
			/>
		{/if}
		<div class="text-md font-medium text-gray-900 truncate">
			{displayTeamName(team.name)}
		</div>
	</div>
{/if}
