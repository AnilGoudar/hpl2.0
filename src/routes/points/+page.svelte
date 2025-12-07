<script>
	import { staticApiData } from '$lib/state/+state.svelte.js';
	import { onMount } from 'svelte';

	export let data;
	const { standingsData } = data;

	const currentSeason = staticApiData?.seasons?.find((season) =>
		['Scheduled', 'Active'].includes(season.status)
	);

	function displayTeamName(name) {
		switch (name) {
			case 'BSS Hunters':
				return 'BSS';
				break;
			case 'Rani Chennamma Warriors':
				return 'RCW';
				break;
			case 'SRC':
				return 'SRC';
				break;
			case 'Angadi Kings':
				return 'AK';
				break;
			case 'GSN Yuva Gharjane':
				return 'GSN';
				break;
		}
	}
</script>

<div class="w-full bg-white">
	<h1 class="text-2xl text-gray-800 mb-4 text-center border-b border-gray-900 pb-2">
		<span class="uppercase font-bold">{currentSeason.name}</span> Standings
	</h1>

	<div class="overflow-x-auto shadow-lg rounded-lg border border-gray-500">
		<table class="w-full bg-white divide-y divide-gray-300">
			<thead class="bg-[#8bccf1] text-white sticky top-0 z-10">
				<tr>
					<th>#</th>
					<th class="text-left pl-[10px]">Team</th>
					<th>M</th>
					<th>W</th>
					<th>L</th>
					<th>NRR</th>
					<th>Pts</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each standingsData || [] as team, index}
					<tr>
						<td class="px-[2px] py-3 text-center text-sm font-extrabold text-gray-800 bg-gray-50"
							>{index + 1}</td
						>
						<td class="pl-3 py-3 ml-[10px]">
							<div class="flex items-center gap-2">
								<img
									class="h-6 w-6 rounded-full object-cover shadow-lg"
									src={team.logo_url}
									alt="{team.name}team"
								/>
								<div class="text-sm font-medium text-gray-900 truncate">
									{displayTeamName(team.team_name)}
								</div>
							</div>
						</td>
						<td class="px-2 py-3 text-center text-sm text-gray-700">
							{team.matches}
						</td>
						<td class="px-2 py-3 text-center text-sm text-gray-700">{team.wins}</td>
						<td class="px-2 py-3 text-center text-sm text-gray-700">{team.losses}</td>
						<td class="px-2 py-3 text-center text-sm text-gray-700">{team.net_run_rate_display}</td>
						<td class="px-2 py-3 text-base font-extrabold text-center text-sm text-gray-700"
							>{team.points}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="text-xs text-gray-500 mt-4 text-center">M: Matches, NRR: Net Run Rate, Pts: Points.</p>
</div>
