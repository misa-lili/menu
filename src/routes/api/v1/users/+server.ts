import { workers_token, account_id, users_namespace_id } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

const namespace_id = users_namespace_id;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const key = url.searchParams.get('key');
	const pw = url.searchParams.get('pw');
	if (key && pw) {
		// Login
		const result = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${url.searchParams.get(
				'key'
			)}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${workers_token}`
				}
			}
		)
			.then((response) => response.json())
			.catch((error) => {
				throw new Error(error);
			});

		if (result.password == pw) return json({ ok: true, status: 200 });
		else return json({ ok: false, status: 401 });
	} else if (key && !pw) {
		// check email is exists
		const body = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${url.searchParams.get(
				'key'
			)}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${workers_token}`
				}
			}
		)
			.then((response) => response.json())
			.catch((error) => {
				throw new Error(error);
			});

		if (body.result === null) {
			return json({ ok: false, status: 404 });
		} else {
			return json({ ok: true, status: 200 });
		}
	} else {
		// TODO: deprecated?
		return fetch(
			`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/keys`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workers_token}` }
			}
		);
	}
}

export async function PUT({ url, request }) {
	const body = JSON.stringify(await request.json());
	await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${url.searchParams.get(
			'key'
		)}`,
		{
			method: 'PUT',
			headers: {
				// 'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${workers_token}`
			},
			body
		}
	);

	//TODO: 제대로 하세요~
	return json({ ok: true, status: 200 });
}
