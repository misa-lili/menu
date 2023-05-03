<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';
	import bcrypt from 'bcryptjs';

	let isSignUp: boolean = false;

	let email: string = '';
	let isEmailError: boolean = false;

	let password: string = '';
	let isPasswordError: boolean = false;

	let password2: string = '';
	let isPassword2Error: boolean = false;

	let mid: string = '';
	let isMidError: boolean = false;

	const signIn = async () => {
		const result = await fetch(`/api/v1/users?key=${email}&pw=${password}`).then((r) => r.json());

		if (result.status === 200) {
			window.sessionStorage.setItem('atoken', result.body.atoken);
			window.sessionStorage.setItem('rtoken', result.body.rtoken);
			goto(`/${result.body.mids[0]}`);
		} else alert('회원 정보를 확인해 주세요');
	};

	const toggleSignUp = () => {
		isSignUp = !isSignUp;
	};

	const signUp = async () => {
		// 이메일 유효성 검사
		if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
			isEmailError = true;
			return alert('이메일이 유효하지 않습니다.');
		}

		// 이메일 존재하는지 확인
		const user = await fetch(`/api/v1/users?key=${email}`).then((r) => r.json());
		if (user.ok) {
			isEmailError = true;
			return alert(`해당 이메일로 이미 가입된 회원이 있습니다.`);
		}

		// 패스워드 일치
		if (password !== password2) {
			isPasswordError = true;
			isPassword2Error = true;
			return alert(`암호가 암호 재입력과 일치하지 않습니다.`);
		}

		// 패스워드 4자 이상
		if (password.length < 4) {
			isPasswordError = true;
			isPassword2Error = true;
			return alert(`암호를 4자 이상으로 입력해 주세요.`);
		}

		// mid a-z,_,-유효성 검사
		if (!/^[0-9A-Za-z\-_]+$/.test(mid)) {
			isMidError = true;
			return alert(`메뉴 아이디는 영어, 숫자, 대시만 사용 가능합니다.`);
		}

		// mid 존재하는지 확인
		const menu = await fetch(`/api/v1/menus?key=${mid}`).then((r) => r.json());
		if (menu.ok) {
			isMidError = true;
			return alert(`해당 메뉴 아이디는 이미 존재합니다.`);
		}

		// TODO: 이메일 인증

		// users에 put
		const result = await fetch(`/api/v1/users?key=${email}`, {
			method: 'POST',
			body: JSON.stringify({
				password,
				mids: [mid]
			})
		}).then((r) => r.json());

		// menus에 put
		await fetch(`/api/v1/menus?key=${mid}`, {
			method: 'POST',
			body: JSON.stringify({
				title: '',
				headers: [],
				footers: [],
				groups: []
			})
		});

		// a, r토큰 저장
		window.sessionStorage.setItem('atoken', result.body.atoken);
		window.sessionStorage.setItem('rtoken', result.body.rtoken);

		// 가입 완료
		alert(`회원 가입 되었습니다.`);

		// goto /mid
		goto(`/${mid}`);
	};
</script>

<div class="py-9 px-6 space-y-9">
	<div class="text-center text-6xl font-bold font-mono">QQUR</div>
	<hr />
	<div class="flex flex-col space-y-6">
		<input
			type="email"
			placeholder="이메일"
			class="font-extralight bg-stone-100 rounded-full p-3 px-5 border"
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
			class="font-extralight bg-stone-100 rounded-full p-3 px-5 border"
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
		{#if isSignUp === true}
			<input
				transition:fade
				type="password"
				placeholder="암호 재입력"
				class="font-extralight bg-stone-100 rounded-full p-3 px-5 border"
				class:border-red-400={isPassword2Error}
				class:text-red-400={isPassword2Error}
				bind:value={password2}
				on:focus={() => {
					if (isPassword2Error) {
						password = '';
						password2 = '';
						isPasswordError = false;
						isPassword2Error = false;
					}
				}}
			/>
			<input
				transition:fade
				type="text"
				placeholder="메뉴 아이디 (가입 이후 수정 가능)"
				class="font-extralight bg-stone-100 rounded-full p-3 px-5 border"
				class:border-red-400={isMidError}
				class:text-red-400={isMidError}
				bind:value={mid}
				on:focus={() => {
					if (isMidError) {
						mid = '';
						isMidError = false;
					}
				}}
			/>
		{/if}
		<input
			type="button"
			class="font-extralight h-12 rounded-full bg-black text-white px-3 cursor-pointer"
			value={isSignUp ? '회원가입' : '로그인'}
			on:click={() => {
				if (isSignUp) signUp();
				else signIn();
			}}
		/>
		<div class="font-extralight text-center">
			{isSignUp ? '이미 회원이세요?' : '뀨알이 처음이세요?'}
			<a on:click={toggleSignUp} class="cursor-pointer text-blue-500 font-medium"
				>{isSignUp ? '로그인' : '가입'}</a
			>하러 갈게요.
		</div>
	</div>
	<hr />
	<h1 class="text-4xl">심플한 <b>무료</b> QR 메뉴 서비스</h1>
	<div>서비스 설명 쭉 아래로</div>
</div>
