<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	let items: {
		name: string;
		glass: number;
		bottle: number;
		description: string;
	}[];
	$: items = data.results.map((r) =>
		Object.entries(r.properties).reduce((acc, [k, v]) => {
			if (v.type === 'number') acc[k] = v.number;
			else if (v.type === 'title') acc[k] = v.title[0].text.content;
			else if (v.type === 'rich_text') acc[k] = v.rich_text[0].text.content;
			else acc[k] = null;
			return acc;
		}, {})
	);
</script>

<div>
	{#each items as item}
		<div>
			<div class="flex gap-3">
				<div>
					{item.name}
				</div>
				<div>
					{item.glass}
				</div>
				<div>
					{item.bottle}
				</div>
			</div>
			<div>
				{item.description}
			</div>
		</div>
	{/each}
</div>
