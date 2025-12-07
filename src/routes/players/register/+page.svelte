<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import UpiNote from '$lib/components/UpiNote.svelte';
	import { startLoading, stopLoading } from '$lib/state/+state.svelte';
	import { compressImage, fakePayementScreenshots } from '$lib/utils';
	import { hplFetch } from '$lib/utils/api';
	let fullName = '';
	let phone = '';
	let role = 'Batsman';
	let photoFile = null;
	let previewPlayer = null;
	let paymentFile = null;
	let paymentPreview = null;

	async function handlePhotoFileChange(event, type) {
		const file = event.target.files[0];
		if (!file) return;
		if (type === 'payment') {
			const { warnings, isSuspicious } = await fakePayementScreenshots(file);
			if (isSuspicious) {
				alert(warnings[0]);
				return;
			}
		}
		const compressedFile = await compressImage(file, 900, 0.6);
		let newFile = new File([compressedFile], file.name.replace(/\.[^/.]+$/, '.jpg'), {
			type: 'image/jpeg'
		});
		if (type === 'payment') {
			paymentFile = newFile;
			paymentPreview = URL.createObjectURL(newFile);
		} else {
			photoFile = newFile;
			previewPlayer = URL.createObjectURL(newFile);
		}
	}

	async function uploadFile(file, storage) {
		const form = new FormData();
		form.append('file', file);
		form.append('storage', storage);
		const resp = await hplFetch(fetch, '/upload', 'POST', form);
		const { url } = await resp.json();
		return url;
	}

	async function registerPlayer() {
		if (!fullName || !phone || !photoFile || !paymentFile) {
			alert('All fields are required for registration.');
			return;
		}
		try {
			startLoading('Registering player...');
			const player_photo_url = await uploadFile(photoFile, 'players');
			const payment_proof_url = await uploadFile(paymentFile, 'payments');

			const registerResp = await hplFetch(fetch, '/players/register', 'POST', {
				name: fullName,
				phone,
				role,
				player_photo_url,
				payment_proof_url
			});
			if (!registerResp.ok) {
				alert('Player registration failed');
				return;
			}
			alert('Player registered successfully');
			fullName = '';
			phone = '';
			role = 'Batsman';
			photoFile = '';
			paymentFile = '';
			goto('/players');
		} catch (e) {
			alert(e.message);
		} finally {
			stopLoading();
		}
	}
</script>

<div class="mx-auto max-w-2xl p-2">
	<h2 class="text-black-800 text-xl font-bold">Player Registration</h2>
	<p class="text-grey-100 font-semi-bold mt-2 text-sm">
		Fill out the form below to register for HPL Season 2
	</p>
	<div class="mt-5 flex flex-col items-center gap-4">
		<div
			class="bg-content-light flex h-28 w-28 items-center justify-center rounded-full border-2 border-gray-400"
			class:border-solid={previewPlayer}
			class:border-dashed={!previewPlayer}
		>
			{#if previewPlayer}
				<img src={previewPlayer} class="h-full w-full rounded-full object-cover" alt="player" />
			{:else}
				<label class="flex cursor-pointer flex-col items-center">
					<span style="font-size: 20px">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="#359EFF"
								d="M3 21q-.825 0-1.412-.587T1 19V7q0-.825.588-1.412T3 5h3.15L7.4 3.65q.275-.3.663-.475T8.875 3H13q.425 0 .713.288T14 4t-.288.713T13 5H8.875L7.05 7H3v12h16v-8q0-.425.288-.712T20 10t.713.288T21 11v8q0 .825-.587 1.413T19 21zM19 5h-1q-.425 0-.712-.288T17 4t.288-.712T18 3h1V2q0-.425.288-.712T20 1t.713.288T21 2v1h1q.425 0 .713.288T23 4t-.288.713T22 5h-1v1q0 .425-.288.713T20 7t-.712-.288T19 6zm-8 12.5q1.875 0 3.188-1.312T15.5 13t-1.312-3.187T11 8.5T7.813 9.813T6.5 13t1.313 3.188T11 17.5m0-2q-1.05 0-1.775-.725T8.5 13t.725-1.775T11 10.5t1.775.725T13.5 13t-.725 1.775T11 15.5"
							/>
						</svg>
					</span>
					<input
						class="sr-only"
						name="player-photo"
						type="file"
						accept="image/*"
						onchange={(event) => handlePhotoFileChange(event)}
					/>
					<p class="text-grey-700 text-sm font-medium">Add Photo</p>
				</label>
			{/if}
		</div>
		<div class="form-field w-full">
			<label for="full-name" class="text-sm font-medium text-[#4574a1]">Full Name</label>
			<input
				bind:value={fullName}
				type="text"
				id="full-name"
				placeholder="Player Name"
				class="justyify-center bg-content-light focus:border-primary focus:ring-primary mt-1 flex h-12 w-full items-center rounded-lg border border-solid border-[#e6edf4] px-4 text-base text-[#0c151d] shadow-sm"
			/>
		</div>
		<div class="form-field w-full">
			<label for="phone-number" class="text-sm font-medium text-[#4574a1]">Mobile</label>
			<input
				bind:value={phone}
				type="text"
				id="phone-number"
				placeholder="Phone Number"
				class="justyify-center bg-content-light focus:border-primary focus:ring-primary mt-1 flex h-12 w-full items-center rounded-lg border border-solid border-[#e6edf4] px-4 text-base text-[#0c151d] shadow-sm"
			/>
		</div>

		<div class="form-field w-full">
			<label for="position" class="text-sm font-medium text-[#4574a1]">Player Position</label>
			<select
				bind:value={role}
				name="player-role"
				id="position"
				class="focus:border-primary focus:ring-primary mt-1 flex h-12 w-full items-center justify-center rounded-lg border border-solid border-[#e6edf4] px-4 text-base text-[#0c151d]"
			>
				<option value="Batsman">Batsman</option>
				<option value="Bowler">Bowler</option>
				<option value="AllRounder">All-Rounder</option>
				<option value="WicketKeeper">Wicketkeeper</option>
			</select>
		</div>

		<UpiNote />

		<div class="form-field mt-4 w-full">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="text-sm font-medium text-[#4574a1]">Upload Payment Screenshot</label>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="mt-2 flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-400 bg-gray-50"
				onclick={() => document.getElementById('payment-proof').click()}
			>
				{#if paymentPreview}
					<img src={paymentPreview} alt="payment proof" class="h-full w-full object-contain p-2" />
				{:else}
					<p class="text-sm text-gray-500">Click to upload screenshot</p>
				{/if}
			</div>

			<input
				id="payment-proof"
				class="hidden"
				type="file"
				accept="image/*"
				onchange={(event) => handlePhotoFileChange(event, 'payment')}
			/>
		</div>

		<div class="mt-5 w-full">
			<Button text="Register" type="primary" onClick={registerPlayer} />
		</div>
	</div>
</div>
