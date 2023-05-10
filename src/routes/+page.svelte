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

	const toggleSignUp = () => {
		isSignUp = !isSignUp;
	};

	const signIn = async () => {
		const result = await fetch(`/api/v1/users?key=${email}&pw=${password}`).then((r) => r.json());

		if (result.status === 200) {
			window.sessionStorage.setItem('atoken', result.body.atoken);
			window.sessionStorage.setItem('rtoken', result.body.rtoken);
			goto(`/${result.body.mids[0]}`);
		} else alert('회원 정보를 확인해 주세요');
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
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				password,
				mids: [mid]
			})
		}).then((r) => r.json());

		// menus에 put
		await fetch(`/api/v1/menus?key=${mid}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
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
	<div class="text-center text-6xl font-bold font-mono">
		QQUR<span class="text-2xl">(BETA)</span>
	</div>
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
	<div>
		<header>
			<h1>심플한 QR 메뉴 서비스를 소개합니다</h1>
		</header>

		<header>
			<h2>쉽게 메뉴판을 만들어보세요</h2>
		</header>
		<p>
			안녕, 친구들! 뀨알(QQUR)이라는 멋진 웹 서비스를 소개할게! 레스토랑이나 바에서 메뉴판을 만드는
			일을 쉽게 해준단다. 이 서비스를 사용하면 누구나 간단하게 메뉴판을 디자인할 수 있어. 그리고
			예쁜 템플릿도 많이 제공하고 있어서 원하는 스타일로 메뉴판을 꾸밀 수 있단다!
		</p>
		<header>
			<h2>QR 코드로 손쉽게 메뉴 확인</h2>
		</header>
		<p>
			예를 들어, 친구들이랑 가게를 찾아갔을 때 메뉴판을 찾기 어려울 때가 있잖아? 뀨알(QQUR)은
			가게에서 제공하는 QR 코드를 찍으면 바로 메뉴판을 볼 수 있어! 이렇게 되면 가게에서 메뉴판을
			찾느라 헤매는 일도 줄어들 거야. 그리고 이건 손님들에게도 편리하고 가게 주인들에게도 좋은
			방법인 것 같아!
		</p>
		<header>
			<h2>메뉴판 업데이트가 쉬워요</h2>
		</header>
		<p>
			가게 주인들도 메뉴판을 쉽게 바꿀 수 있어. 새로운 음식이나 음료가 생기면 그냥 웹사이트에서
			수정하면 돼. 그리고 친구들은 바로 새 메뉴를 확인할 수 있단다! 이렇게 하면 가게 주인들이 메뉴
			변경이나 가격 수정을 쉽게 할 수 있어서 편리하게 운영할 수 있을 거야.
		</p>
		<header>
			<h2>종이 메뉴판도 만들 수 있어요</h2>
		</header>
		<p>
			그리고 만약 가게 주인이 종이 메뉴판을 원한다면, 뀨알(QQUR)에서 만든 메뉴판을 프린터로 출력할
			수도 있어. 이렇게 되면 디지털과 종이 형태의 메뉴판을 동시에 사용할 수 있어서 더 많은 고객들
			에게 편리함을 제공할 수 있어. 종이 메뉴판이 필요한 상황이나 고객의 선호도에 따라 유연하게
			대응할 수 있게 되는 거지!
		</p>
		<header>
			<h2>무료로 이용하세요</h2>
		</header>
		<p>
			그리고 또 한 가지 좋은 소식이 있어! 뀨알(QQUR)은 완전히 무료야! 레스토랑과 바의 메뉴판
			만들기를 쉽게 해주는 뀨알(QQUR)을 사용해 보도록 해! 가게 주인들에게 비용 부담 없이 이 멋진
			서비스를 이용할 수 있게 해줘서 정말 좋은 것 같아.
		</p>
		<header>
			<h2>지금 바로 시작해보세요</h2>
		</header>
		<p>
			지금 바로 뀨알(QQUR)에 가입해서 멋진 메뉴판을 만들어보는 건 어때? 사용법도 간단하고, 많은
			기능들이 무료로 제공되니까 이 기회를 놓치지 마! 레스토랑이나 바의 메뉴판 만들기가 이렇게
			쉬워질 줄 누가 알았겠어?
		</p>
	</div>
</div>

<style>
	body {
		@apply bg-gray-200 p-8;
	}

	header {
		@apply text-center py-4;
	}

	h1 {
		@apply text-4xl font-semibold mb-6;
	}

	h2 {
		@apply text-2xl font-semibold mt-12 mb-4;
	}

	p {
		@apply text-lg leading-7 mb-6;
	}
</style>
