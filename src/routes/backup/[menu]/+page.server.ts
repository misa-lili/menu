import { token, db } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	console.log(params.menu);

	return await fetch(`https://api.notion.com/v1/databases/${db}/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Notion-Version': '2022-06-28',
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			sorts: [
				{
					property: 'order',
					direction: 'ascending'
				}
			]
		})
	})
		.then((response) => response.json())
		.catch((err) => console.error(err));
}
