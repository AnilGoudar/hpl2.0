<script>
	import TeamCard from '$lib/components/TeamCard.svelte';
	import { staticApiData } from '$lib/state/+state.svelte';
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-3 p-5">
	{#each staticApiData.teams as team (team.id)}
		<TeamCard {team} />
	{/each}
</div>
