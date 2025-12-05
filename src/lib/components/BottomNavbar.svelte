<script>
    import Players from "$lib/assets/Icons/players.svg";
    import Teams from "$lib/assets/Icons/teams.svg";
    import Fixtures from "$lib/assets/Icons/fixtures.svg";
    import Table from "$lib/assets/Icons/table.svg";
    import Home from "$lib/assets/Icons/home.svg";
    import Login from "$lib/assets/Icons/login.svg";
    import { page } from '$app/state';
	import { onMount } from "svelte";

    const navLinks = [
        {title: "Home", href: '/', iconId: Home, path:''},
        {title: "Players", href: '/players', iconId: Players, path: 'players'},
        {title: "Teams", href: '/teams', iconId: Teams, path: 'teams'},
        {title: "Fixtures", href: "/fixtures", iconId: Fixtures, path: 'fixtures'},
        {title: 'Login', href: '/login', iconId: Login, path: 'login'}
    ]

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