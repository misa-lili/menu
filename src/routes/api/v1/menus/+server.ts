import { workers_token, account_id, menus_namespace_id } from '$env/static/private';
import { json } from '@sveltejs/kit';

const namespace_id = menus_namespace_id;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const key = url.searchParams.get('key');

	// Get menu
	if (key) {
		const body = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${key}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${workers_token}`
				}
			}
		).then((r) => r.json());

		if (body.result === null) {
			return json({ ok: false, status: 404 });
		} else {
			return json({ ok: true, status: 200, body });
		}
	}
}

export async function PUT({ url, request }) {
	const key = url.searchParams.get('key');
	const body = JSON.stringify(await request.json());
	// PUT menu
	await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${key}`,
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
