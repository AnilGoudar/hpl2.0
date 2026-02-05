<script>
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { bottomNavLinks, userState } from '$lib/state/+state.svelte';
	let isLoggedIn = $derived.by(() => Boolean(userState.id));
	let activeNav = $derived.by(() => page.url.pathname.split('/')[1] || '');
</script>

<div
	class="fixed bottom-0 left-0 w-full h-20 bg-white/95 backdrop-blur-md shadow-[0_-2px_6px_rgba(0,0,0,0.1)] flex justify-around items-center z-50 md:w-[400px] md:left-1/2 md:transform md:-translate-x-1/2 rounded-tl-lg rounded-tr-lg"
>
	{#each bottomNavLinks as nav}
		{#if nav.title !== 'Points Table'}
			{#if !(nav.title === 'Login' && isLoggedIn)}
				{#if !(nav.title === 'Profile' && !isLoggedIn)}
					<a href={nav.href} class="flex flex-col items-center">
						<img src={nav.iconId} class="w-[22px] h-[22px]" alt="nav icon" />
						<span
							class={nav.path === activeNav
								? 'text-sm font-medium text-blue-500 underline underline-offset-4'
								: 'text-sm font-medium'}
						>
							{nav.title}
						</span>
					</a>
				{/if}
			{/if}
		{/if}
	{/each}
</div>
