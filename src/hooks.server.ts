import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ resolve, event }) => {
	const response = await resolve(event);
	const validDomains = /^(.*)?\.?example\.com$/;
	let cors: string | false;

	if (validDomains.test(event.url.hostname)) {
		cors = `https://${event.url.hostname}`;
	} else {
		cors = false;
	}

	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api')) {
		// Required for CORS to work
		if (event.request.method === 'OPTIONS' && !!cors) {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
					'Access-Control-Allow-Origin': cors
				}
			});
		}

		response.headers.append('Access-Control-Allow-Origin', cors.toString());
	}

	return response;
};
