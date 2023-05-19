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
		dispatch('relayout');
	};
	const toggleEdit = () => {
		dispatch('toggleEdit');
	};
</script>

<div
	class="_toolbar fixed z-50 flex w-full bottom-3 left-0 mx-auto justify-center pointer-events-none"
>
	<div class="flex p-2 justify-center bg-pink-400 text-white gap-1 rounded-xl pointer-events-auto">
		<div on:click|preventDefault={save} on:touchend|preventDefault={save}>
			<Icon src={CloudArrowUp} class="w-6 h-6 cursor-pointer" />
		</div>
		<div on:click|preventDefault={toggleEdit} on:touchend|preventDefault={toggleEdit}>
			{#if isGuest}
				<Icon src={LockOpen} class="w-6 h-6 cursor-pointer" />
			{:else}
				<Icon src={LockClosed} class="w-6 h-6 cursor-pointer" />
			{/if}
		</div>
		{#if selected !== null}
			<span class="px-2 opacity-50 cursor-default">|</span>
		{/if}
		{#if selected?.type === 'title'}
			<div on:click|preventDefault={() => {}} on:touchend|preventDefault={() => {}}>
				<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
			</div>
			<div on:click|preventDefault={() => {}} on:touchend|preventDefault={() => {}}>
				<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
			</div>
		{/if}
		{#if selected?.type === 'header'}
			<div on:click|preventDefault={removeHeader} on:touchend|preventDefault={removeHeader}>
				<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderHeader(false)}
				on:touchend|preventDefault={() => orderHeader(false)}
			>
				<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderHeader(true)}
				on:touchend|preventDefault={() => orderHeader(true)}
			>
				<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
			</div>
		{/if}
		{#if selected?.type === 'group'}
			<div on:click|preventDefault={removeGroup} on:touchend|preventDefault={removeGroup}>
				<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderGroup(false)}
				on:touchend|preventDefault={() => orderGroup(false)}
			>
				<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderGroup(true)}
				on:touchend|preventDefault={() => orderGroup(true)}
			>
				<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
			</div>
		{/if}
		{#if selected?.type === 'item'}
			<div on:click|preventDefault={removeItem} on:touchend|preventDefault={removeItem}>
				<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
			</div>
			<div on:click|preventDefault={outItem} on:touchend|preventDefault={outItem}>
				<Icon src={MinusCircle} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderItem(false)}
				on:touchend|preventDefault={() => orderItem(false)}
			>
				<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderItem(true)}
				on:touchend|preventDefault={() => orderItem(true)}
			>
				<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
			</div>
		{/if}
		{#if selected?.type === 'footer'}
			<div on:click|preventDefault={removeFooter} on:touchend|preventDefault={removeFooter}>
				<Icon src={Trash} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderFooter(false)}
				on:touchend|preventDefault={() => orderFooter(false)}
			>
				<Icon src={ArrowUp} class="w-6 h-6 cursor-pointer" />
			</div>
			<div
				on:click|preventDefault={() => orderFooter(true)}
				on:touchend|preventDefault={() => orderFooter(true)}
			>
				<Icon src={ArrowDown} class="w-6 h-6 cursor-pointer" />
			</div>
		{/if}
	</div>
</div>
