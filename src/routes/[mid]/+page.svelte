<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	import {
		Icon,
		Trash,
		ArrowUp,
		ArrowDown,
		PlusCircle,
		Plus,
		FolderPlus,
		CloudArrowUp,
		UserGroup,
		Cog6Tooth,
		Bolt
	} from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import jsonData from './data.json';
	import dummyData from './dummy.json';
	import { error } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import jwt_decode from 'jwt-decode';
	import { goto } from '$app/navigation';

	let menu: Menu = dummyData;

	$: {
		menu = data.body;
	}

	let isGuest: boolean = true;
	let isOwner: boolean = false;

	onMount(async () => {
		insertImage(menu.title, menu.title);

		const atoken = window.sessionStorage.getItem('atoken');
		if (atoken && jwt_decode(atoken).mids.includes($page.params.mid)) {
			isOwner = true;
		}
	});

	const addHeader = () => {
		menu.headers = [...menu.headers, ''];
	};

	const addItem = (group) => {
		group.items = [
			...group.items,
			{
				name: '',
				price: '',
				description: '',
				image: ''
			}
		];

		menu.groups = menu.groups;
	};

	const inputTitle = (event) => {
		menu.title = event.target.innerText;
	};

	const placehold = (event) => {
		if (event.target.innerText.trim().length === 0) {
			event.target.innerText = '';
		}
	};

	const insertImage = () => {
		const target = document.querySelector('._title');
		if (/^https?:\/\//.test(menu.title) && target) {
			target.innerHTML = `<img src="${menu.title.trim()}">`;
		}
		// https://i.imgur.com/ji9VuwA.jpeg
	};

	let isSaving = false;
	const save = async () => {
		if (isSaving === true) return;
		isSaving = true;
		const mid = window.location.pathname.slice(1);
		const result = await fetch(`/api/v1/menus?key=${mid}`, {
			method: 'PUT',
			body: JSON.stringify(menu)
		}).then((r) => r.json());
		if (result.ok === true) alert('저장되었습니다.');
		isSaving = false;
	};

	const splice = (arr: any[], idx: number) => {
		arr.splice(idx, 1);
		menu = menu;
	};

	const swapOrder = (arr: any[], idx: number, next: boolean) => {
		const length = arr.length;
		if (idx === length - 1 && next === true) return;
		if (idx === 0 && next === false) return;
		if (next === true) {
			const temp = JSON.parse(JSON.stringify(arr[idx + 1]));
			arr[idx + 1] = JSON.parse(JSON.stringify(arr[idx]));
			arr[idx] = temp;
		} else {
			const temp = JSON.parse(JSON.stringify(arr[idx - 1]));
			arr[idx - 1] = JSON.parse(JSON.stringify(arr[idx]));
			arr[idx] = temp;
		}
		menu = menu;
	};
</script>

<div class="flex space-x-1" class:hidden={!isOwner}>
	<div class="cursor-pointer text-orange-500 hover:text-orange-400" on:click={save}>
		<Icon src={CloudArrowUp} class="w-6 h-6" />
	</div>
	<div
		class="cursor-pointer text-orange-500 hover:text-orange-400"
		on:click={() => {
			isGuest = !isGuest;
		}}
	>
		{#if isGuest}
			<Icon src={Cog6Tooth} class="w-6 h-6" />
		{:else}
			<Icon src={UserGroup} class="w-6 h-6" />
		{/if}
	</div>
</div>

<div
	class="
		_template flex flex-col space-y-4
		m-6 sm:m-8 md:m-12
		sm:space-y-12
	"
>
	<div class="_header_container flex flex-col">
		<div
			class="_title"
			placeholder={isGuest ? '' : 'Title'}
			class:hidden={isGuest && menu.title === ''}
			contenteditable={!isGuest}
			on:input={(event) => {
				menu.title = event.target.innerText;
			}}
			on:blur={(event) => {
				placehold(event);
				insertImage();
			}}
		>
			{menu.title}
		</div>
		{#each menu.headers as header, idx (idx)}
			<div class="flex">
				<div class="flex-1">
					<div
						class="_header"
						class:hidden={isGuest && header === ''}
						placeholder={isGuest ? '' : 'Description'}
						contenteditable={!isGuest}
						on:input={(event) => {
							menu.headers[idx] = event.target.innerText;
						}}
						on:blur={placehold}
					>
						{header}
					</div>
				</div>
				<div class="_xud" class:hidden={isGuest} class:flex={!isGuest}>
					<div on:click={() => splice(menu.headers, idx)}>
						<Icon src={Trash} class="w-6 h-6" />
					</div>
					<div on:click={() => swapOrder(menu.headers, idx, false)}>
						<Icon src={ArrowUp} class="w-6 h-6" />
					</div>
					<div on:click={() => swapOrder(menu.headers, idx, true)}>
						<Icon src={ArrowDown} class="w-6 h-6" />
					</div>
				</div>
			</div>
		{/each}
		<div class="flex">
			<div
				class="inline-block space-x-1 text-sm items-center text-violet-500 hover:text-violet-400 cursor-pointer"
				class:hidden={isGuest}
				on:click={addHeader}
			>
				<Icon src={Plus} class="w-6 h-6" />
			</div>
		</div>
	</div>

	<div class="_groups">
		{#each menu.groups as group, gidx (gidx)}
			<div class="_group flex flex-col">
				<div class="flex items-end">
					<div
						class="_group_name uppercase flex-1"
						class:hidden={isGuest && group === ''}
						placeholder={isGuest ? '' : 'Group Name'}
						contenteditable={!isGuest}
						on:input={(event) => {
							menu.groups[gidx].name = event.target.innerText;
						}}
						on:blur={placehold}
					>
						{group.name}
					</div>
					<div
						class="_group_col font-mono text-right"
						class:hidden={isGuest && !group.col}
						placeholder="칸 설명"
						contenteditable={!isGuest}
						on:input={(event) => {
							menu.groups[gidx].col = event.target.innerText;
						}}
						on:blur={placehold}
					>
						{group.col ? group.col : ''}
					</div>
					<div class="_xud" class:hidden={isGuest} class:flex={!isGuest}>
						<div on:click={() => splice(menu.groups, gidx)}>
							<Icon src={Trash} class="w-6 h-6" />
						</div>
						<div on:click={() => swapOrder(menu.groups, gidx, false)}>
							<Icon src={ArrowUp} class="w-6 h-6" />
						</div>
						<div on:click={() => swapOrder(menu.groups, gidx, true)}>
							<Icon src={ArrowDown} class="w-6 h-6" />
						</div>
					</div>
				</div>
				{#each group.items as item, iidx (iidx)}
					<div class="flex">
						<div class="_item flex-grow flex flex-col">
							<div class="flex">
								<div
									class="_item_name uppercase"
									placeholder={isGuest ? '' : '상품 이름'}
									contenteditable={!isGuest}
									on:input={(event) => {
										menu.groups[gidx].items[iidx].name = event.target.innerText;
									}}
									on:blur={placehold}
								>
									{item.name}
								</div>
								<div
									class="_item_price font-mono text-right"
									placeholder={isGuest ? '' : '가격'}
									contenteditable={!isGuest}
									on:input={(event) => {
										menu.groups[gidx].items[iidx].price = event.target.innerText;
									}}
									on:blur={placehold}
								>
									{item.price}
								</div>
								<div class="_xud__pink" class:hidden={isGuest} class:flex={!isGuest}>
									<div on:click={() => splice(menu.groups[gidx].items, iidx)}>
										<Icon src={Trash} class="w-6 h-6" />
									</div>
									<div on:click={() => swapOrder(menu.groups[gidx].items, iidx, false)}>
										<Icon src={ArrowUp} class="w-6 h-6" />
									</div>
									<div on:click={() => swapOrder(menu.groups[gidx].items, iidx, true)}>
										<Icon src={ArrowDown} class="w-6 h-6" />
									</div>
								</div>
							</div>
							<div
								class="_description text-sm"
								placeholder="Description"
								contenteditable={!isGuest}
								on:input={(event) => {
									menu.groups[gidx].items[iidx].description = event.target.innerText;
								}}
								on:blur={placehold}
							>
								{item.description}
							</div>
						</div>
					</div>
				{/each}
				<div class="flex">
					<div
						class="inline-block space-x-1 text-sm items-center cursor-pointer text-pink-500 hover:text-pink-400"
						class:hidden={isGuest}
						on:click={() => {
							addItem(group);
						}}
					>
						<Icon src={Plus} class="w-6 h-6" />
					</div>
				</div>
			</div>
		{/each}
		<div>
			<div
				class="inline-block space-x-1 text-sm items-center cursor-pointer text-violet-500 hover:text-violet-400"
				class:hidden={isGuest}
				on:click={() => {
					menu.groups = [...menu.groups, { name: '', items: [] }];
				}}
			>
				<Icon src={FolderPlus} class="w-6 h-6" />
			</div>
		</div>
	</div>

	<div class="_footer_container flex flex-col">
		{#each menu.footers as footer, idx (idx)}
			<div class="flex">
				<div
					class="_footer flex-1"
					placeholder="Footer"
					contenteditable={!isGuest}
					on:input={(event) => {
						footer = event.target.innerText;
					}}
					on:blur={placehold}
				>
					{footer}
				</div>

				<div class="_xud" class:hidden={isGuest} class:flex={!isGuest}>
					<div on:click={() => splice(menu.footers, idx)}>
						<Icon src={Trash} class="w-6 h-6" />
					</div>
					<div on:click={() => swapOrder(menu.footers, idx, false)}>
						<Icon src={ArrowUp} class="w-6 h-6" />
					</div>
					<div on:click={() => swapOrder(menu.footers, idx, true)}>
						<Icon src={ArrowDown} class="w-6 h-6" />
					</div>
				</div>
			</div>
		{/each}
		<div class="flex justify-end text-right">
			<div class="flex cursor-pointer text-violet-500" on:click={() => goto('/')}>
				<Icon src={Bolt} class="w-6 h-6" /> <span>BY 뀨알</span>
			</div>
		</div>
		<div class="flex justify-end">
			<div
				class="inline-block text-sm items-center cursor-pointer text-violet-500 hover:text-violet-400"
				class:hidden={isGuest}
				on:click={() => {
					menu.footers = [...menu.footers, ''];
				}}
			>
				<Icon src={Plus} class="w-6 h-6" />
			</div>
		</div>
	</div>
</div>

<style lang="postcss" global>
	/* div {
		@apply border border-slate-500 p-2;
	} */
	div:focus {
		@apply outline-none;
	}

	._xud {
		@apply text-violet-500;
	}

	._xud > div {
		@apply hover:text-violet-400 cursor-pointer;
	}

	._xud__pink {
		@apply text-pink-500;
	}
	._xud__pink > div {
		@apply hover:text-pink-400 cursor-pointer;
	}

	._title {
		@apply font-black outline-none text-8xl leading-[4.8rem] overflow-visible caret-slate-500;
	}

	[placeholder]:empty::before {
		content: attr(placeholder);
		color: #aaa;
	}

	[placeholder]:empty:focus::before {
		content: '';
	}

	._header {
		@apply text-xl;
	}

	._group_name {
		@apply uppercase font-medium text-3xl font-mono;
	}

	._item_name {
		@apply basis-auto flex-grow text-xl uppercase decoration-slice;
	}

	._footer_container {
	}

	._footer {
		@apply text-right;
	}
</style>
