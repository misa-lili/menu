import {
	workers_token,
	account_id,
	users_namespace_id,
	private_key,
	algorithm
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { signToken } from '$lib/server/jwt.js';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

const namespace_id = users_namespace_id;
const hashArrayBuffer = crypto.createHash('sha256').update(private_key).digest();

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	// 로그인
	const email = url.searchParams.get('key');
	if (email === null) return json({ ok: false, status: 500 });
	const pw = url.searchParams.get('pw');

	if (email && pw) {
		const client = new DynamoDBClient({ region: 'ap-northeast-2' });
		const command = new GetItemCommand({
			TableName: 'user',
			Key: {
				key: { S: email }
			}
		});
		const response = await client.send(command);

		if (response.Item?.value.S === undefined) return json({ ok: false, status: 404 });

		const user: User = JSON.parse(response.Item.value.S);

		const compare = await bcrypt.compare(pw, user.password);

		if (compare) {
			const atoken = signToken({ sub: 'a', uid: email, mids: user.mids });
			const rtoken = signToken({ sub: 'r', uid: email, mids: user.mids });
			return json({ ok: true, status: 200, body: { mids: user.mids, atoken, rtoken } });
		} else {
			return json({ ok: false, status: 401 });
		}
	} else if (email && !pw) {
		const client = new DynamoDBClient({ region: 'ap-northeast-2' });
		const command = new GetItemCommand({
			TableName: 'user',
			Key: {
				key: { S: email }
			}
		});
		const response = await client.send(command);

		if (response.Item?.value.S === undefined) return json({ ok: false, status: 404 });
		else return json({ ok: true, status: 200 });
	}
}

export async function PUT({ url, request }) {
	// 회원 가입
	const email = url.searchParams.get('key');
	if (email === null) return json({ ok: false, status: 500 });
	const body = await request.json();

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
}

function unsecureEncrypt(text: string): string {
	const cipher = crypto.createCipheriv(algorithm, hashArrayBuffer, null);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
}

function unsecureDecrypt(encryptedText: string): string {
	const decipher = crypto.createDecipheriv(algorithm, hashArrayBuffer, null);
	let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
