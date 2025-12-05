<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BottomNavbar from '$lib/components/BottomNavbar.svelte';
	import { bottomNavLinks, loadingState, setUser } from '$lib/state/+state.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const storedUser = localStorage.getItem('hpl-user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			const user = {
				id: userData.user_id,
				role: userData.role,
				email: userData.email
			}
			setUser(user)
		}
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout-wrapper">
<Header />
<main class="layout-content px-2 pt-5 bg-gray-50">
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
		height: 100vh;
	}
	.layout-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}
</style>