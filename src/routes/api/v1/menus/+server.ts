import { signToken, verifyToken } from '$lib/server/jwt.js';
import { json } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

/**
 * GET /api/v1/menus?key
 * 특정 메뉴를 가져옵니다.
 */
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const key = url.searchParams.get('key');

	if (key) {
		// Get menu from DynamoDB
		const client = new DynamoDBClient({ region: 'ap-northeast-2' });
		const command = new GetItemCommand({
			TableName: 'menu',
			Key: {
				key: { S: key }
			}
		});
		const response = await client.send(command);
		const result = response.Item?.value.S;

		if (result === undefined) return json({ ok: false, status: 404 });
		else return json({ ok: true, status: 200, body: JSON.parse(result) });
	}
}

/**
 * PUT /api/v1/menus?key
 * json body { menu: Menu }
 * 특정 메뉴를 업서트 합니다.
 */
/** @type {import('./$types').RequestHandler} */
export async function PUT({ url, request }) {
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
