<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	type Item = {
		category: string;
		name: string;
		glass: number;
		bottle: number;
		price: number;
		description: string;
	};

	/**
	 * Parsed Raw Data
	 */
	let items: Item[];

	/**
	 * Fixed Items
	 */
	let titles: Item[];
	let headers: Item[];
	let footers: Item[];

	/**
	 * Dynamic Items
	 */
	let groups: { string: Item[] };

	$: {
		items = data.results.map((row) => parseProperties(row));
		titles = items.filter((i) => i.category === 'title');
		headers = items.filter((i) => i.category === 'header');
		footers = items.filter((i) => i.category === 'footer');
		groups = items
			.filter((i) => i.category !== 'title' && i.category !== 'header' && i.category !== 'footer')
			.reduce((acc, cur) => {
				if (acc[cur.category] === undefined) acc[cur.category] = [];
				acc[cur.category].push(cur);
				return acc;
			}, {});
	}

	const parseProperties = (row) =>
		Object.entries(row.properties).reduce((acc, [k, v]) => {
			if (v.type === 'number') acc[k] = v.number || '';
			else if (v.type === 'select') acc[k] = v.select?.name || '';
			else if (v.type === 'title') acc[k] = v.title[0]?.text?.content || '';
			else if (v.type === 'rich_text') acc[k] = v.rich_text[0]?.text?.content || '';
			else acc[k] = '';
			return acc;
		}, {});
</script>

<div>
	<div
		class="
			flex gap-1.5 p-3 m-3
		"
	>
		<div class="flex-1 self-center">
			{#each titles as title}
				<div>
					<div class="flex gap-3 font-extrabold text-4xl">
						<div>
							{title.name}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="flex-1 self-center">
			{#each headers as header}
				<div>
					<div class="flex gap-3">
						<div>
							{header.name}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex-row gap-3 m-3">
		{#each Object.entries(groups) as [category, products]}
			<div class="flex-auto border-1 p-3 my-3">
				<h1 class="uppercase text-2xl">
					{category}
				</h1>
				<div class="border-b-2 my-3" />
				{#each products as product}
					<div class="my-2">
						<div class="flex gap-3">
							<div class="flex-grow text-lg">
								{product.name}
							</div>
							<div>
								{Number(product.glass) === 0 ? '' : (product.glass / 10000).toFixed(1)}
							</div>
							<div>
								{Number(product.bottle) === 0 ? '' : (product.bottle / 10000).toFixed(1)}
							</div>
							<div>
								{Number(product.price) === 0 ? '' : (product.price / 10000).toFixed(1)}
							</div>
						</div>
						<div class="text-xs">
							{product.description}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div>
		{#each footers as footer}
			<div>
				<div class="flex gap-3">
					<div>
						{footer.name}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
