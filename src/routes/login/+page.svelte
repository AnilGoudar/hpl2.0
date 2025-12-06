<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { startLoading, stopLoading } from '$lib/state/+state.svelte';
	import { emailRegex } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';

	let email = $state('');
	let password = $state('');
	let emailError = $state('');
	let passwordError = $state('');
	let generalError = $state('');

	async function handleLogin() {
		try {
			emailError = '';
			passwordError = '';
			generalError = '';
			if (!emailRegex.test(email)) {
				emailError = 'Invalid Email Address';
				return;
			}
			if (password.length < 3) {
				passwordError: 'Invalid Password';
				return;
			}
			startLoading('Logging In...');
			const payload = { email, password };
			const loginResponse = await hplFetch(fetch, '/login', 'POST', payload);
			const { data } = await loginResponse.json();
			localStorage.setItem('hpl-user', JSON.stringify(data));
			const currentPath = page.url.pathname;
			if (currentPath === '/login') {
				window.location.href = '/';
			}
		} catch (error) {
			alert(error);
		} finally {
			stopLoading();
		}
	}
</script>

<div class="w-full flex flex-col gap-4 items-center justify-center rounded-lg shadow-lg px-2 py-4">
	<div class="form-input w-full">
		<label for="email">Email: </label>
		<input
			bind:value={email}
			type="text"
			id="email"
			name="email"
			placeholder="you@hpladmi.com"
			autocomplete="email"
			required
			oninput={() => (emailError = '')}
		/>
		{#if emailError}
			<span class="text-red-800 text-sm">{emailError}</span>
		{/if}
	</div>
	<div class="form-input w-full">
		<label for="password">Password: </label>
		<input
			bind:value={password}
			type="password"
			id="password"
			name="password"
			placeholder="Password"
			autocomplete="current-password"
			required
			oninput={() => (passwordError = '')}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					handleLogin();
				}
			}}
		/>
	</div>

	<button
		onclick={() => handleLogin()}
		class="w-full flex items-center justify-center h-10 text-xl font-bold bg-blue-100 rounded-md shadow-lg mt-10 py-4 active:bg-blue-500 active:text-white"
		>Login</button
	>
</div>

<style>
</style>
