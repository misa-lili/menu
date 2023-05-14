<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data: { body: Menu };

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
	import Toolbar from '$lib/Toolbar.svelte';

	let isMounted: boolean = false;

	let menu: Menu = {
		title: { value: '' },
		footers: [],
		groups: [],
		headers: []
	};

	// $: if (isMounted & menu) {
	// 	relayout();
	// }

	let selected: Selected | null = null;

	const select = (event, parameters: { type: string; gidx?: number; idx?: number; data: any }) => {
		selected = parameters;
	};

	const unselect = () => {
		selected = null;
		relayout();
	};

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
			...data.body,
			title: typeof data.body.title === 'string' ? { value: data.body.title } : data.body.title,
			headers: data.body.headers.map((header) =>
				typeof header === 'string'
					? { id: crypto.randomUUID(), value: header }
					: { ...header, id: crypto.randomUUID() }
			),
			groups: data.body.groups.reduce((acc, cur) => {
				acc = [
					...acc,
					{
						...cur,
						id: crypto.randomUUID(),
						items: cur.items.map((i) => ({ ...i, id: crypto.randomUUID() }))
					}
				];
				return acc;
			}, []),
			footers: data.body.footers.map((footer) => {
				if (typeof footer === 'string') return { id: crypto.randomUUID(), value: footer };
				else return { ...footer, id: crypto.randomUUID() };
			})
		};

		await initMasonry();

		if (menu?.title.value && window && document) {
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

	const relayout = async () => {
		console.log('relayout');
		await initMasonry();
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
		menu.headers = [...menu.headers, { id: crypto.randomUUID(), value: '' }];
	};

	const addGroup = () => {
		menu.groups = [...menu.groups, { name: '', id: crypto.randomUUID(), items: [] }];
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

	const addFooter = () => {
		menu.footers = [...menu.footers, { id: crypto.randomUUID(), value: '' }];
	};

	const handleInputText = (e: InputEvent): string => {
		const div = event.target;
		const caret = window.getSelection().getRangeAt(0).cloneRange().startOffset;
		div.focus();
		const range = document.createRange();
		range.setStart(div.firstChild, caret);
		const sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		return e.target.textContent;
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
		}
	};

	const placehold = (event) => {
		if (event.target.innerText.trim().length === 0) {
			event.target.innerText = '';
		}
	};

	const insertImage = () => {
		const target = document.querySelector('._title');
		if (/^https?:\/\//.test(menu.title.value) && target) {
			target.innerHTML = `<img src="${menu.title.value.trim()}">`;
		}
		// https://i.imgur.com/ji9VuwA.jpeg
	};

	let isSaving = false;
	const save = async () => {
		if (isSaving === true) return;
		isSaving = true;
		const mid = window.location.pathname.slice(1);

		let menuWithoutId: Menu = JSON.parse(JSON.stringify(menu));
		menuWithoutId.headers = menuWithoutId.headers.map((h) => {
			delete h.id;
			return h;
		});
		menuWithoutId.footers = menuWithoutId.footers.map((f) => {
			delete f.id;
			return f;
		});
		menuWithoutId.groups = menuWithoutId.groups.map((g) => {
			delete g.id;

			g.items = g.items.map((i) => {
				delete i.id;
				return i;
			});

			return g;
		});

		const result = await fetch(`/api/v1/menus?key=${mid}`, {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer ' + window.sessionStorage.getItem('atoken')
			},
			body: JSON.stringify(menuWithoutId)
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
				body: JSON.stringify(menuWithoutId)
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
</script>

<svelte:head>
	<title>{$page.params.mid || menu.title || 'qqur.app'}</title>
</svelte:head>

<Toolbar bind:menu bind:selected on:relayout={relayout} on:save={save} />

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

<div
	class="
		_template flex flex-col space-y-4
		m-6 sm:m-8 md:m-12
		sm:space-y-12
	"
>
	<div class="_header_container flex flex-col">
		<div
			class="_title mb-6"
			placeholder={isGuest ? '' : 'Title'}
			contenteditable={!isGuest}
			on:keydown={onKeyDown}
			on:focus={(event) => select(event, { type: 'title', idx: 0, data: menu.title })}
			class:ring={selected?.type === 'title'}
			on:input={(event) => {
				menu.title.value = handleInputText(event);
			}}
			on:blur={(event) => {
				placehold(event);
				insertImage();
				unselect();
			}}
		>
			{menu.title.value}
		</div>
		{#each menu.headers as header, idx (header.id)}
			<div class="flex">
				<div class="flex-1">
					<div
						class="_header"
						placeholder={isGuest ? '' : 'Description'}
						contenteditable={!isGuest}
						on:keydown={onKeyDown}
						on:focus={(event) => select(event, { type: 'header', idx, data: header })}
						class:ring={selected?.type === 'header' && selected?.idx === idx}
						on:input={(event) => {
							header.value = handleInputText(event) || '';
						}}
						on:blur={(event) => {
							placehold(event);
							unselect();
						}}
					>
						{header.value}
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
				class:ring={selected?.type === 'group' && selected?.idx === gidx}
			>
				<div class="flex items-end">
					<div
						class="_group_name flex-1"
						class:hidden={isGuest && group === ''}
						placeholder={isGuest ? '' : '그룹 이름'}
						contenteditable={!isGuest}
						on:keydown={onKeyDown}
						on:focus={(event) => select(event, { type: 'group', idx: gidx, data: group })}
						on:input={(event) => {
							menu.groups[gidx].name = handleInputText(event);
						}}
						on:blur={(event) => {
							placehold(event);
							unselect();
						}}
					>
						{group.name}
					</div>
					<div
						class="_group_col font-mono text-right"
						class:hidden={isGuest && !group.col}
						placeholder={isGuest ? '' : '칸 설명'}
						contenteditable={!isGuest}
						on:keydown={onKeyDown}
						on:focus={(event) => select(event, { type: 'group', idx: gidx, data: group })}
						on:input={(event) => {
							menu.groups[gidx].col = handleInputText(event);
						}}
						on:blur={(event) => {
							placehold(event);
							unselect();
						}}
					>
						{group.col ? group.col : ''}
					</div>
				</div>
				{#each group.items as item, iidx (item.id)}
					<div
						class="flex"
						in:fade|local={{ delay: 100, duration: 200 }}
						out:fade|local={{ delay: 0, duration: 200 }}
						animate:flip={200}
					>
						<div
							class="_item flex-grow flex flex-col"
							class:ring={selected?.type === 'item' &&
								selected?.gidx === gidx &&
								selected?.idx === iidx}
						>
							<div class="flex">
								<div
									class="_item_name text-black"
									class:text-opacity-30={item.out}
									class:line-through={item.out}
									placeholder={isGuest ? '' : '상품 이름'}
									contenteditable={!isGuest}
									on:keydown={onKeyDown}
									on:focus={(event) => select(event, { type: 'item', gidx, idx: iidx, data: item })}
									on:input={(event) => {
										menu.groups[gidx].items[iidx].name = handleInputText(event);
									}}
									on:blur={(event) => {
										placehold(event);
										unselect();
									}}
								>
									{item.name}
								</div>
								<div
									class="_item_price font-mono text-right"
									placeholder={isGuest ? '' : '가격'}
									contenteditable={!isGuest}
									on:keydown={onKeyDown}
									on:focus={(event) => select(event, { type: 'item', gidx, idx: iidx, data: item })}
									on:input={(event) => {
										menu.groups[gidx].items[iidx].price = handleInputText(event);
									}}
									on:blur={(event) => {
										placehold(event);
										unselect();
									}}
								>
									{item.price}
								</div>
							</div>
							<div
								class="_description text-sm"
								placeholder={isGuest ? '' : '상세 설명'}
								contenteditable={!isGuest}
								on:keydown={onKeyDown}
								on:focus={(event) => select(event, { type: 'item', gidx, idx: iidx, data: item })}
								on:input={(event) => {
									menu.groups[gidx].items[iidx].description = handleInputText(event);
								}}
								on:blur={(event) => {
									placehold(event);
									unselect();
								}}
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
		{#each menu.footers as footer, idx (footer.id)}
			<div class="flex">
				<div
					class="_footer flex-1"
					placeholder="Footer"
					contenteditable={!isGuest}
					on:keydown={onKeyDown}
					on:focus={(event) => select(event, { type: 'footer', idx, data: footer })}
					class:ring={selected?.type === 'footer' && selected?.idx === idx}
					on:input={(event) => {
						footer.value = handleInputText(event);
					}}
					on:blur={(event) => {
						placehold(event);
						unselect();
					}}
				>
					{footer.value}
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
	div {
		@apply ring-pink-400 ring-offset-4;
	}
	div:focus {
		@apply outline-none;
	}

	._xud {
		@apply text-violet-500 hidden;
	}

	._xud > div {
		@apply hover:text-violet-400 cursor-pointer;
	}

	._xud__pink {
		@apply text-pink-500 hidden;
	}
	._xud__pink > div {
		@apply hover:text-pink-400 cursor-pointer;
	}

	._title {
		@apply font-black outline-none text-8xl leading-[4.8rem] overflow-visible caret-slate-500;
	}

	[placeholder]:empty::before {
		content: attr(placeholder);
		color: #bbb;
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
		@apply font-medium text-3xl font-mono;
	}

	._item {
		@apply space-y-1;
	}

	._item_name {
		@apply basis-auto flex-grow text-xl decoration-slice;
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
