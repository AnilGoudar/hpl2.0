<script>
	import ChevronRight from '$lib/assets/Icons/chevronRight.svg';
	import { bottomNavLinks } from '$lib/state/+state.svelte';

	const links = bottomNavLinks.filter(
		(link) => link.title !== 'Login' && link.title !== 'Profile' && link.title !== 'Home'
	);
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
