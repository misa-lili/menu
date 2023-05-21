import { workers_token, account_id, menus_namespace_id } from '$env/static/private';
import { signToken, verifyToken } from '$lib/server/jwt.js';
import { json } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';

import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

const namespace_id = menus_namespace_id;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	/**
	 * 특정 메뉴를 가져옵니다.
	 */
	const key = url.searchParams.get('key');

	// Get menu
	if (key) {
		// const body = await fetch(
		// 	`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${key}`,
		// 	{
		// 		method: 'GET',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${workers_token}`
		// 		}
		// 	}
		// ).then((r) => r.json());

		// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html
		const client = new DynamoDBClient({ region: 'ap-northeast-2' });
		const command = new GetItemCommand({
			TableName: 'menu',
			Key: {
				key: { S: key }
			}
		});
		const response = await client.send(command);

		try {
			return json({ ok: true, status: 200, body: JSON.parse(response.Item?.value.S || '{}') });
		} catch (error: any) {
			return json({ ok: false, status: 404, message: error.message });
		}
	}
}

export async function PUT({ url, request }) {
	/**
	 * 특정 메뉴를 업서트 합니다.
	 */
	const key = url.searchParams.get('key');
	const body = JSON.stringify(await request.json());

	const token = request.headers.get('Authorization')?.split(' ')[1] ?? null;

	try {
		if (token === null) {
			// A 토큰이 없음
			throw new Error('401');
		}
		const isValid = verifyToken(token);

		if ((isValid as JwtPayload).mids.includes(key) === false)
			throw new Error('Forbidden: no permission');
	} catch (error: any) {
		return json({ ok: false, status: 403, message: error.message });
	}

	let atoken = null;
	const payload: JwtPayload = verifyToken(token) as JwtPayload;
	if (payload.sub === 'r') {
		atoken = signToken({ sub: 'a', uid: payload.uid, mids: payload.mids });
	}

	// PUT menu
	// await fetch(
	// 	`https://api.cloudflare.com/client/v4/accounts/${account_id}/storage/kv/namespaces/${namespace_id}/values/${key}`,
	// 	{
	// 		method: 'PUT',
	// 		headers: {
	// 			// 'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001',
	// 			'Content-Type': 'application/json',
	// 			Authorization: `Bearer ${workers_token}`
	// 		},
	// 		body
	// 	}
	// );

	const client = new DynamoDBClient({ region: 'ap-northeast-2' });
	const command = new PutItemCommand({
		TableName: 'menu',
		Item: {
			key: { S: key! },
			value: { S: body! }
		}
	});

	client
		.send(command)
		.then((response) => {
			console.log('Item inserted successfully:', response);
		})
		.catch((error) => {
			console.error('Error:', error);
		});

	return json({ ok: true, status: 200, body: { atoken } });
}
