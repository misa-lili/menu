import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { signToken } from '$lib/server/jwt.js';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

/**
 * GET /api/v1/users?key&pw
 * 이메일 중복 확인 및 로그인
 */
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const email = url.searchParams.get('key');
		const pw = url.searchParams.get('pw');

		/**
		 * 필수 파라미터가 없을 경우
		 */
		if (email === null) return json({ ok: false, status: 500 });

		/**
		 * 이메일 중복 확인
		 */
		if (!pw) {
			const client = new DynamoDBClient({ region: 'ap-northeast-2' });
			const command = new GetItemCommand({
				TableName: 'user',
				Key: {
					key: { S: email }
				}
			});
			const response = await client.send(command);

			if (response.Item?.value.S) return json({ ok: true, status: 200 });
			else return json({ ok: false, status: 404 });
		}

		/**
		 * 로그인
		 */
		if (email && pw) {
			const client = new DynamoDBClient({ region: 'ap-northeast-2' });
			const command = new GetItemCommand({
				TableName: 'user',
				Key: {
					key: { S: email }
				}
			});
			const response = await client.send(command);

			if (!response.Item?.value.S) return json({ ok: false, status: 404 });

			const user: User = JSON.parse(response.Item.value.S);

			const compare = await bcrypt.compare(pw, user.password);

			if (compare) {
				const atoken = signToken({ sub: 'a', uid: email, mids: user.mids });
				const rtoken = signToken({ sub: 'r', uid: email, mids: user.mids });
				return json({ ok: true, status: 200, body: { mids: user.mids, atoken, rtoken } });
			} else {
				return json({ ok: false, status: 401 });
			}
		}
	} catch (error: any) {
		return json({ ok: false, status: 500, message: error?.message ?? 'Internal Server Error' });
	}
}

/**
 * PUT /api/v1/users?key
 * json body { password, mids }
 * 회원 가입
 */
/** @type {import('./$types').RequestHandler} */
export async function PUT({ url, request }) {
	try {
		const email = url.searchParams.get('key');
		const body = await request.json();

		if (email === null) return json({ ok: false, status: 500 });

		// password 단방향 암호화
		const hashedPassword = await bcrypt.hash(body.password, await bcrypt.genSalt(10));

		// request to dynamodb
		const client = new DynamoDBClient({ region: 'ap-northeast-2' });
		const command = new PutItemCommand({
			TableName: 'user',
			Item: {
				key: { S: email },
				value: { S: JSON.stringify({ ...body, password: hashedPassword }) }
			}
		});
		await client.send(command);

		// JWT
		const atoken = signToken({ sub: 'a', uid: email, mids: body.mids });
		const rtoken = signToken({ sub: 'r', uid: email, mids: body.mids });
		return json({ ok: true, status: 200, body: { atoken, rtoken } });
	} catch (error: any) {
		return json({ ok: false, status: 500, message: error?.message ?? 'Internal Server Error' });
	}
}
