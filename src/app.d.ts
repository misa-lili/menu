// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// key is mid
	type Menu = {
		title: string;
		headers: [string];
		footers: [string];
		groups: [
			{
				name: string;
				col?: string;
				items: [
					{
						name: string;
						price: string;
						description?: string;
						image?: string;
						out?: boolean;
					}
				];
			}
		];
	};

	/** key is email */
	type User = {
		password: string;
		mids: [mid: string];
	};
}

export {};
