<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BottomNavbar from '$lib/components/BottomNavbar.svelte';
	import {
		bottomNavLinks,
		loadingState,
		setStaticApiData,
		setUser
	} from '$lib/state/+state.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { children } = $props();

	onMount(() => {
		const storedUser = localStorage.getItem('hpl-user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			const user = {
				id: userData.user_id,
				role: userData.role,
				email: userData.email
			};
			setUser(user);
			const currentPath = page.url.pathname;
			if (currentPath === '/login') {
				window.location.href = '/';
			}
		} else {
			setUser({ id: '', role: '', email: '' });
		}

		// set static data fetched from api
		setStaticApiData({
			teams: page.data.teams,
			playerCategories: page.data.playerCategories,
			seasons: page.data.seasons
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout-wrapper border border-gray-300 sm:max-w-[400px] sm:mx-auto">
	<Header />
	<main class="layout-content px-2 pt-5">
		{@render children()}
	</main>
	<BottomNavbar />
	<Footer />
</div>

{#if loadingState.isLoading}
	<div class="fixed inset-0 z-50 flex flex-col gap-8 items-center justify-center bg-black/60">
		<div
			class="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"
		></div>
		<div class="text-xl font-bold text-white">{loadingState.message}</div>
	</div>
{/if}

<style>
	.layout-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.layout-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}
</style>
