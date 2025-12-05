<script>
    import { page } from '$app/state';
	import { onMount } from "svelte";
	import { bottomNavLinks, userState } from "$lib/state/+state.svelte";
    let navLinks = $derived.by(() => {
        let links = bottomNavLinks;
        if (userState.id) {
            links = bottomNavLinks.filter((link) => link.title != 'Login');
        }
        return links;
    });
    let activeNav = $derived(page.url.pathname.split('/')[1] || '');
</script>
<div class="fixed bottom-0 left-0 w-full h-20 bg-white/95 backdrop-blur-md shadow-[0_-2px_6px_rgba(0,0,0,0.1)] flex justify-around items-center z-50 md:hidden">
    {#each navLinks as navLink}
        <a href={navLink.href} class="flex flex-col items-center">
            <img src={navLink.iconId} alt="navitem" class="w-[22px] h-[22px]"/>
            <span class={navLink.path === activeNav ? "text-sm font-medium underline underline-offset-4 text-blue-500" : "text-sm font-medium"}>{navLink.title}</span>
        </a>
    {/each}
</div>