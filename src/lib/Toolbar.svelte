<script lang="ts">
	import {
		Icon,
		Trash,
		ArrowUp,
		ArrowDown,
		Plus,
		CloudArrowUp,
		LockClosed,
		LockOpen,
		MinusCircle
	} from 'svelte-hero-icons';
	import Logout from 'svelte-material-icons/Logout.svelte';
	import ContentSave from 'svelte-material-icons/ContentSave.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let menu: Menu | null = null;
	export let selected: Selected | null = null;
	export let isGuest = false;

	/**
	 * TITLE
	 */
	const setTitleFontSize = () => {};
	/**
	 * HEADER
	 */
	const removeHeader = () => {
		if (!confirm('선택한 머릿말을 삭제하시겠습니까?')) return;
		remove(menu?.headers, selected?.idx);
	};
	const orderHeader = (next: boolean) => {
		swapOrder(menu?.headers, selected?.idx, next);
	};
	/**
	 * GROUP
	 */
	const removeGroup = () => {
		if (!confirm('선택한 그룹을 삭제하시겠습니까?')) return;
		remove(menu?.groups, selected?.idx);
	};
	const orderGroup = (next: boolean) => {
		swapOrder(menu?.groups, selected?.idx, next);
	};
	/**
	 * ITEM
	 */
	const removeItem = () => {
		if (!confirm('선택한 아이템을 삭제하시겠습니까?')) return;
		remove(menu?.groups[selected?.gidx].items, selected?.idx);
	};
	const orderItem = (next: boolean) => {
		swapOrder(menu?.groups[selected?.gidx].items, selected?.idx, next);
	};
	const outItem = () => {
		menu.groups[selected.gidx].items[selected.idx].out =
			!!!menu.groups[selected.gidx].items[selected.idx].out;
	};
	/**
	 * FOOTER
	 */
	const removeFooter = () => {
		if (!confirm('선택한 바닥글을 삭제하시겠습니까?')) return;
		remove(menu?.footers, selected?.idx);
	};
	const orderFooter = (next: boolean) => {
		swapOrder(menu?.footers, selected?.idx, next);
	};

	/**
	 *
	 */
	const save = () => {
		if (!confirm('현재 메뉴를 저장하시겠습니까?')) return;
		dispatch('save');
	};
	const remove = (arr: any[], idx) => {
		arr.splice(idx, 1);
		selected = null;
		menu = menu;
		dispatch('relayout');
	};
	const swapOrder = (arr: any[], idx: number, next: boolean) => {
		const length = arr.length;
		if (idx === length - 1 && next === true) return;
		if (idx === 0 && next === false) return;
		if (next === true) {
			const temp = JSON.parse(JSON.stringify(arr[idx + 1]));
			arr[idx + 1] = JSON.parse(JSON.stringify(arr[idx]));
			arr[idx] = temp;
			selected.idx = selected.idx + 1;
		} else {
			const temp = JSON.parse(JSON.stringify(arr[idx - 1]));
			arr[idx - 1] = JSON.parse(JSON.stringify(arr[idx]));
			arr[idx] = temp;
			selected.idx = selected.idx - 1;
		}
		selected = selected;
		menu = menu;

		selected.target.scrollIntoView({ block: 'center', behavior: 'smooth' });

		dispatch('relayout');
	};
	const signOut = () => {
		if (!confirm('로그아웃 하시겠습니까?')) return;

		dispatch('signOut');
	};
</script>

<div
	class="_toolbar fixed z-50 flex bottom-3 left-1/2 -translate-x-1/2 mx-auto justify-center p-2 bg-pink-400 text-white gap-1 rounded-xl"
>
	<div on:mousedown|preventDefault={save} on:touchstart|preventDefault={save}>
		<ContentSave class="w-6 h-6 cursor-pointer" />
	</div>
	<div on:mousedown|preventDefault={signOut} on:touchstart|preventDefault={signOut}>
		<Logout class="w-6 h-6 cursor-pointer" />
	</div>
	{#if selected !== null}
		<span class="px-2 opacity-50 cursor-default">|</span>
	{/if}
	{#if selected?.type === 'title'}
		<div on:mousedown|preventDefault={() => {}} on:touchstart|preventDefault={() => {}}>
			<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div on:mousedown|preventDefault={() => {}} on:touchstart|preventDefault={() => {}}>
			<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
		</div>
	{/if}
	{#if selected?.type === 'header'}
		<div on:mousedown|preventDefault={removeHeader} on:touchstart|preventDefault={removeHeader}>
			<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderHeader(false)}
			on:touchstart|preventDefault={() => orderHeader(false)}
		>
			<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderHeader(true)}
			on:touchstart|preventDefault={() => orderHeader(true)}
		>
			<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
		</div>
	{/if}
	{#if selected?.type === 'group'}
		<div on:mousedown|preventDefault={removeGroup} on:touchstart|preventDefault={removeGroup}>
			<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderGroup(false)}
			on:touchstart|preventDefault={() => orderGroup(false)}
		>
			<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderGroup(true)}
			on:touchstart|preventDefault={() => orderGroup(true)}
		>
			<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
		</div>
	{/if}
	{#if selected?.type === 'item'}
		<div on:mousedown|preventDefault={removeItem} on:touchstart|preventDefault={removeItem}>
			<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
		</div>
		<div on:mousedown|preventDefault={outItem} on:touchstart|preventDefault={outItem}>
			<Icon src={MinusCircle} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderItem(false)}
			on:touchstart|preventDefault={() => orderItem(false)}
		>
			<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderItem(true)}
			on:touchstart|preventDefault={() => orderItem(true)}
		>
			<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
		</div>
	{/if}
	{#if selected?.type === 'footer'}
		<div on:mousedown|preventDefault={removeFooter} on:touchstart|preventDefault={removeFooter}>
			<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderFooter(false)}
			on:touchstart|preventDefault={() => orderFooter(false)}
		>
			<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div
			on:mousedown|preventDefault={() => orderFooter(true)}
			on:touchstart|preventDefault={() => orderFooter(true)}
		>
			<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
		</div>
	{/if}
</div>
