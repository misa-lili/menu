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
		out: boolean;
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
			else if (v.type === 'checkbox') acc[k] = v.checkbox;
			else acc[k] = '';
			return acc;
		}, {});
</script>

<div
	class="
		m-6 sm:m-8 md:m-12
		space-y-9 sm:space-y-12
		border-r border-black
		bg-gradient-to-r from-indigo-500
	"
>
	<div
		id="top"
		class="
			grid
			grid-cols-1
			gap-y-6
			gap-x-9 lg:gap-x-24
			p-1
		"
	>
		<div class="self-center">
			{#each titles as title}
				<div
					class="
						font-black
					"
					style="
						font-size: 6.25rem;
						line-height: 4.5rem;
					"
				>
					{title.name}
				</div>
			{/each}
		</div>
		<div class="self-center">
			{#each headers as header}
				<div class="text-2xl">
					{header.name}
				</div>
			{/each}
		</div>
	</div>

	<div
		class="
			grid
			grid-cols-1 sm:grid-cols-2
			gap-y-9
			gap-x-9 lg:gap-x-24
		"
	>
		{#each Object.entries(groups) as [category, products]}
			<div class="border-0 border-black p-2">
				<h1 class="uppercase font-medium text-3xl font-mono">
					{category}
				</h1>
				<div class="border-b border-black my-3" />
				{#each products as product}
					<div class="my-4">
						<div class="flex space-x-3 pr-0.5">
							<div
								class="basis-auto flex-grow text-xl uppercase decoration-slice"
								class:line-through={product.out}
							>
								{product.name}
							</div>
							{#if product.glass !== ''}
								<div class="basis-[10%] font-serif text-lg text-right">
									{product.glass < 0 ? '' : (product.glass / 10000).toFixed(1)}
								</div>
							{/if}
							{#if product.bottle !== ''}
								<div class="basis-[10%] font-serif text-lg text-right">
									{product.bottle < 0 ? '' : (product.bottle / 10000).toFixed(1)}
								</div>
							{/if}
							{#if product.price !== ''}
								<div class="basis-[10%] font-serif text-lg text-right">
									{product.price < 0 ? '' : (product.price / 10000).toFixed(1)}
								</div>
							{/if}
						</div>
						<div class="text-sm">
							{product.description}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div class="flex justify-end px-2.5">
		{#each footers as footer}
			<div class="font-mono">
				{footer.name}
			</div>
		{/each}
	</div>
</div>
