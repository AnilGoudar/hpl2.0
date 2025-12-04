<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout-wrapper">
<Header />
<main class="layout-content px-2 pt-5 bg-gray-50">
	{@render children()}
</main>
<Footer />
</div>

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