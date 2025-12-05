<script>
	import Players from '$lib/assets/Icons/players.svg';
	import Teams from '$lib/assets/Icons/teams.svg';
	import Fixtures from '$lib/assets/Icons/fixtures.svg';
	import Table from '$lib/assets/Icons/table.svg';
	import ChevronRight from '$lib/assets/Icons/chevronRight.svg';

	const links = [
		{ title: 'Players', href: '/players', iconId: Players },
		{ title: 'Teams', href: '/teams', iconId: Teams },
		{ title: 'Fixtures', href: '/fixtures', iconId: Fixtures },
		{ title: 'Points Table', href: '/points', iconId: Table }
	];
</script>

<section class="">
	<h2 class="text-sm uppercase font-bold">QUICK ACCESS</h2>
	<div class="grid grid-cols-2 gap-4 mt-2">
		{#each links as link}
			<div class="card">
				<a href={link.href} class="flex justify-between items-start">
					<div class="flex flex-col gap-2">
						<img src={link.iconId} alt="link" class="w-[20px] h-[20px]" />
						<span class="text-md text-gray-800">{link.title}</span>
					</div>
					<img src={ChevronRight} alt="go to" class="w-[20px] h-[20px]" />
				</a>
			</div>
		{/each}
	</div>
</section>
