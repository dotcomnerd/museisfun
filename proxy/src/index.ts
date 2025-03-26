/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/**
 * Simple R2 proxy worker that serves files from buckets based on path
 */

export interface Env {
	SONGS_BUCKET: R2Bucket;
	COVERS_BUCKET: R2Bucket;
	PFP_BUCKET: R2Bucket;
	TEST_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// Handle routes
		if (path === '/' || path === '') {
			return new Response('Image Proxy Service', {
				headers: { 'Content-Type': 'text/plain' },
			});
		}

		// Get the bucket and key from the path
		const pathParts = path.split('/').filter((p) => p);

		if (pathParts.length < 1) {
			return new Response('Invalid path', { status: 400 });
		}

		let bucket: R2Bucket;
		let objectKey: string;

		// In development, always use test bucket
		if (request.url.includes('localhost')) {
			bucket = env.TEST_BUCKET;

			// Handle /images/ prefix
			if (pathParts[0] === 'images') {
				pathParts.shift();
				if (pathParts.length === 0) {
					return new Response('Invalid path', { status: 400 });
				}
			}
			objectKey = pathParts.join('/');
		} else {
			// In production, use specific buckets
			if (pathParts[0] === 'images') {
				pathParts.shift();
				if (pathParts.length === 0) {
					return new Response('Invalid path', { status: 400 });
				}
				const type = pathParts[0] as string;
				if (type === 'covers') {
					bucket = env.COVERS_BUCKET;
				} else if (type === 'pfps') {
					bucket = env.PFP_BUCKET;
				} else {
					return new Response('Invalid image type', { status: 400 });
				}
				pathParts.shift();
			} else {
				const bucketName = pathParts[0];
				if (bucketName === 'muse-covers') {
					bucket = env.COVERS_BUCKET;
				} else if (bucketName === 'muse-pfps') {
					bucket = env.PFP_BUCKET;
				} else if (bucketName === 'muse-songs') {
					bucket = env.SONGS_BUCKET;
				} else {
					return new Response('Invalid bucket', { status: 400 });
				}
				pathParts.shift();
			}
			objectKey = pathParts.join('/');
		}

		if (!objectKey) {
			return new Response('No object key specified', { status: 400 });
		}

		// Try to get the object
		let object;
		try {
			object = await bucket.get(objectKey);
		} catch (error) {
			console.error('Error fetching object:', error);
			return new Response('Error fetching object', { status: 500 });
		}

		if (!object) {
			return new Response('Object Not Found', { status: 404 });
		}

		// Set response headers
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		headers.set('Cache-Control', 'public, max-age=31536000, immutable');
		headers.set('Access-Control-Allow-Origin', '*');

		return new Response(object.body, { headers });
	},
} satisfies ExportedHandler<Env>;
