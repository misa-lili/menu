<script>
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let url = 'https://qqur.app';

	let imageURL;

	onMount(async () => {
		const canvas = await QRCode.toCanvas(url, { color: { light: '#0000' } });
		imageURL = canvas.toDataURL();
	});
</script>

<div>
	{#if imageURL}
		<img src={imageURL} alt="QR code" />
	{:else}
		<p>Loading QR code...</p>
	{/if}
</div>
