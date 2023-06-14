<script lang="ts">
	export let visible = false;
	export let x = 0;
	export let y = 0;

	let dragX = 0;
	let dragY = 0;

	function handleMouseDown(event) {
		dragX = event.clientX - x;
		dragY = event.clientY - y;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event) {
		x = event.clientX - dragX;
		y = event.clientY - dragY;
	}

	function handleMouseUp() {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}
</script>

{#if visible}
	<div class="fixed border z-50" style="left: {x}px; top: {y}px;" on:mousedown={handleMouseDown}>
		<slot />
	</div>
{/if}
