<script>
	import { goto } from '$app/navigation';

	let user = $state(null);

	// Load user from localStorage
	if (typeof window !== 'undefined') {
		user = JSON.parse(localStorage.getItem('hpl-user') || "null");
	}

	function logout() {
		// Clear local storage
		localStorage.removeItem('hpl-user');

		// Clear cookies (server handles deleting refresh token)
		document.cookie = "hpl_access_token=; Max-Age=0; path=/;";
		document.cookie = "hpl_refresh_token=; Max-Age=0; path=/;";

		window.location.href = '/login';
	}
</script>

{#if user}
 <div class="container flex flex-col gap-[20px] py-10 px-2 w-full">
    <div class="flex items-center gap-4">
        <h2 class="text-lg">Name: </h2>
        <p class="text-lg font-bold text-gray-900">{user.name || 'Admin'}</p>
    </div>
    <div class="flex tems-center gap-4">
        <h2 class="text-lg">Email: </h2>
        <p class="text-lg font-bold text-gray-900">{user.email || 'Admin'}</p>
    </div>
    <div class="flex tems-center gap-4">
        <h2 class="text-lg">Role: </h2>
        <p class="text-lg font-bold text-gray-900">{user.role || 'Admin'}</p>
    </div>

    <button class="mt-40" onclick={logout}>Logout</button>
 </div>
{:else}
<div class="min-h-screen flex items-center justify-center text-gray-700">
	<p>No profile found. Redirecting...</p>
</div>
{/if}
<style>
    .container {
        gap: 20px;
    }
    button {
        margin-top: 40px;
        background: rgb(239, 86, 86);
        color: white;
        padding: 4px;
        font-weight: 500;
        height: 40px;
        border-radius: 4px;
        letter-spacing: 2px;
    }
</style>