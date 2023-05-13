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
		Bolt,
		LockClosed,
		LockOpen,
		XMark,
		MinusCircle
	} from 'svelte-hero-icons';
	import { onMount } from 'svelte';
	import { error } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import jwt_decode from 'jwt-decode';
	import { goto } from '$app/navigation';
	import Qr from '$lib/QR.svelte';

	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { init } from 'svelte/internal';

	let isMounted: boolean = false;

	let menu: Menu = {
		title: '',
		footers: [],
		groups: [],
		headers: []
	};
	$: if (isMounted && menu) {
		relayout();
	}

	let isGuest: boolean = true;
	let isOwner: boolean = false;
	let isExpired: boolean = false;

	let Masonry = null;
	let masonry;

	let email: string = '';
	let isEmailError: boolean = false;

	let password: string = '';
	let isPasswordError: boolean = false;

	onMount(async () => {
		isMounted = true;

		menu = {
			...(data.body as Menu),
			groups: (data.body as Menu).groups.reduce((acc, cur) => {
				acc = [
					...acc,
					{
						...cur,
						id: crypto.randomUUID(),
						items: cur.items.map((i) => ({ ...i, id: crypto.randomUUID() }))
					}
				];
				return acc;
			}, [])
		};

		await initMasonry();

		if (menu?.title && window && document) {
			insertImage();
		}

		const atoken = window.sessionStorage.getItem('atoken');
		if (atoken && jwt_decode(atoken).mids.includes($page.params.mid)) {
			isOwner = true;
			toggleEdit(true);
		} else {
			toggleEdit(false);
		}
	});

	const initMasonry = async () => {
		Masonry = (await import('masonry-layout')).default;
		masonry = new Masonry('.m-container', {
			itemSelector: '.m-card',
			gutter: 60
		});
	};

	const relayout = () => {
		initMasonry();
	};

	const toggleEdit = async (value?: boolean) => {
		if (value === true) {
			isGuest = false;
		} else if (value === false) {
			isGuest = true;
		} else {
			isGuest = !isGuest;
		}
	};

	const addHeader = () => {
		menu.headers = [...menu.headers, ''];
	};

	const addGroup = () => {
		menu.groups = [...menu.groups, { name: '안녕', id: crypto.randomUUID(), items: [] }];
		menu.groups = menu.groups;
	};

	const addItem = (group) => {
		group.items = [
			...group.items,
			{
				name: '',
				price: '',
				description: '',
				image: '',
				id: crypto.randomUUID()
			}
		];
		menu.groups = menu.groups;
	};

	const handleInputText = (event): string => {
		const inputText = event.target.innerText;
		const inputWords = inputText.splice(' ');
		const newInputText = inputWords.slice(1).join(' ');
		event.target.innerText = newInputText;
		return event.target.innerText;
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

		// TODO: SAVE WITHOUT ID
		const result = await fetch(`/api/v1/menus?key=${mid}`, {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer ' + window.sessionStorage.getItem('atoken')
			},
			body: JSON.stringify(menu)
		})
			.then((r) => r.json())
			.catch((error) => {
				console.log(error);
			});

		if ([401, 403].includes(result.status)) {
			console.log('토큰이 만료되어 rtoken으로 재시도');
			const result2 = await fetch(`/api/v1/menus?key=${mid}`, {
				method: 'PUT',
				headers: {
					Authorization: 'Bearer ' + window.sessionStorage.getItem('rtoken')
				},
				body: JSON.stringify(menu)
			})
				.then((r) => r.json())
				.catch((error) => {
					console.log(error);
				});

			if (result2.status === 200) {
				window.sessionStorage.setItem('atoken', result2.body.atoken);
				alert('저장되었습니다.');
			} else {
				isExpired = true;
				alert('로그인이 만료되었습니다.'); // TODO: 세션에 임시 저장?
			}
		}

		if (result.status === 200) alert('저장되었습니다.');
		isSaving = false;
	};

	const signInAndSave = async () => {
		const result = await fetch(`/api/v1/users?key=${email}&pw=${password}`).then((r) => r.json());

		if (result.status === 200) {
			window.sessionStorage.setItem('atoken', result.body.atoken);
			window.sessionStorage.setItem('rtoken', result.body.rtoken);
			save();
			isExpired = false;
		} else alert('회원 정보를 확인해 주세요');
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

<svelte:head>
	<title>{$page.params.mid || menu.title || 'qqur.app'}</title>
</svelte:head>

<dialog class="bg-white/50 fixed w-full h-full" open={isExpired}>
	<div class="bg-white border rounded-3xl flex flex-col space-y-6 px-3 pt-3 pb-12">
		<div class="flex justify-end">
			<div
				class="cursor-pointer"
				on:click={() => {
					isExpired = false;
				}}
			>
				<Icon src={XMark} class="w-6 h-6" />
			</div>
		</div>
		<p class="text-center">로그인이 만료되었습니다. 로그인해주세요.</p>
		<input
			type="email"
			placeholder="이메일"
			class="font-extralight bg-stone-100 rounded-full p-3 px-5 border shadow-inner"
			class:border-red-400={isEmailError}
			class:text-red-400={isEmailError}
			bind:value={email}
			on:focus={() => {
				if (isEmailError) {
					email = '';
					isEmailError = false;
				}
			}}
		/>
		<input
			type="password"
			placeholder="암호"
			class="font-extralight bg-stone-100 rounded-full p-3 px-5 border shadow-inner"
			class:border-red-400={isPasswordError}
			class:text-red-400={isPasswordError}
			bind:value={password}
			on:focus={() => {
				if (isPasswordError) {
					password = '';
					password2 = '';
					isPasswordError = false;
					isPassword2Error = false;
				}
			}}
		/>

		<input
			type="button"
			class="font-extralight h-12 rounded-full bg-black text-white px-3 cursor-pointer"
			value="로그인"
			on:click={signInAndSave}
		/>
	</div>
</dialog>

<div class="flex space-x-1" class:hidden={!isOwner}>
	<div class="cursor-pointer text-orange-500 hover:text-orange-400" on:click={save}>
		<Icon src={CloudArrowUp} class="w-6 h-6" />
	</div>
	<div
		class="cursor-pointer text-orange-500 hover:text-orange-400"
		on:click={() => {
			// isGuest = !isGuest;
			toggleEdit();
		}}
	>
		{#if isGuest}
			<Icon src={LockOpen} class="w-6 h-6" />
		{:else}
			<Icon src={LockClosed} class="w-6 h-6" />
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
				menu.title = handleInputText(event.target.innerText) || '';
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
							menu.headers[idx] = handleInputText(event.target.innerText);
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

	<div class="_groups m-container">
		{#each menu.groups as group, gidx (group.id)}
			<div
				class="_group m-card w-full sm:w-[calc(100%/2-30px)] flex flex-col"
				in:fade|local={{ delay: 100, duration: 200 }}
				out:fade|local={{ delay: 0, duration: 200 }}
				animate:flip={200}
			>
				<div class="flex items-end">
					<div
						class="_group_name uppercase flex-1"
						class:hidden={isGuest && group === ''}
						placeholder={isGuest ? '' : '그룹 이름'}
						contenteditable={!isGuest}
						on:input={(event) => {
							menu.groups[gidx].name = handleInputText(event.target.innerText);
						}}
						on:blur={placehold}
					>
						{group.name}
					</div>
					<div
						class="_group_col font-mono text-right"
						class:hidden={isGuest && !group.col}
						placeholder={isGuest ? '' : '칸 설명'}
						contenteditable={!isGuest}
						on:input={(event) => {
							menu.groups[gidx].col = handleInputText(event.target.innerText);
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
				{#each group.items as item, iidx (item.id)}
					<div
						class="flex"
						in:fade|local={{ delay: 100, duration: 200 }}
						out:fade|local={{ delay: 0, duration: 200 }}
						animate:flip={200}
					>
						<div class="_item flex-grow flex flex-col">
							<div class="flex">
								<div
									class="_item_name uppercase text-black"
									class:text-opacity-30={item.out}
									class:line-through={item.out}
									placeholder={isGuest ? '' : '상품 이름'}
									contenteditable={!isGuest}
									on:input={(event) => {
										menu.groups[gidx].items[iidx].name = handleInputText(event.target.innerText);
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
										menu.groups[gidx].items[iidx].price = handleInputText(event.target.innerText);
									}}
									on:blur={placehold}
								>
									{item.price}
								</div>
								<div class="_xud__pink" class:hidden={isGuest} class:flex={!isGuest}>
									<div on:click={() => splice(menu.groups[gidx].items, iidx)}>
										<Icon src={Trash} class="w-6 h-6" />
									</div>
									<div
										on:click={() => {
											menu.groups[gidx].items[iidx].out = !!!menu.groups[gidx].items[iidx].out;
										}}
									>
										<Icon src={MinusCircle} class="w-6 h-6" />
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
								placeholder={isGuest ? '' : '상세 설명'}
								contenteditable={!isGuest}
								on:input={(event) => {
									menu.groups[gidx].items[iidx].description = handleInputText(
										event.target.innerText
									);
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
		<div class="_group m-card w-full sm:w-[calc(100%/2-30px)] flex flex-col">
			<div
				class="inline-block space-x-1 text-sm items-center cursor-pointer text-violet-500 hover:text-violet-400"
				class:hidden={isGuest}
				on:click={addGroup}
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
						footer = handleInputText(event.target.innerText);
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
		<div class="flex justify-end">
			<Qr url={`https://qqur.app/${$page.params.mid}`} />
		</div>
		<div class="flex justify-end text-right">
			<div class="flex cursor-pointer text-violet-500" on:click={() => goto('/')}>
				<Icon src={Bolt} class="w-6 h-6" /> <span>BY 뀨알</span>
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
		@apply text-lg;
	}

	._groups {
	}

	._group {
		@apply space-y-6 mb-12;
	}

	._group_name {
		@apply uppercase font-medium text-3xl font-mono;
	}

	._item {
		@apply space-y-1;
	}

	._item_name {
		@apply basis-auto flex-grow text-xl uppercase decoration-slice;
	}

	._item_price {
		@apply font-extralight;
	}

	._description {
		@apply font-extralight;
	}

	._footer_container {
	}

	._footer {
		@apply text-right;
	}
</style>
