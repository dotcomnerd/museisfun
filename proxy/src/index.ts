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
			return new Response('R2 Proxy Service', {
				headers: { 'Content-Type': 'text/plain' },
			});
		}

		// Get the bucket and key from the path
		const pathParts = path.split('/').filter((p) => p);

		if (pathParts.length < 1) {
			return new Response('Not Found', { status: 404 });
		}

		let bucketName = pathParts[0];
		let bucket: R2Bucket;
		let objectKey = '';

		// Join the remaining path parts to form the object key
		if (pathParts.length > 1) {
			objectKey = pathParts.slice(1).join('/');
		}

		// Map bucket path to R2 bucket binding
		if (bucketName === 'muse-test') {
			bucket = env.TEST_BUCKET;
		} else if (bucketName === 'muse-songs') {
			bucket = env.SONGS_BUCKET;
		} else if (bucketName === 'muse-covers') {
			bucket = env.COVERS_BUCKET;
		} else if (bucketName === 'muse-pfps') {
			bucket = env.PFP_BUCKET;
		} else {
			// If no valid bucket, return 404
			return new Response('Bucket Not Found', { status: 404 });
		}

		if (!bucket) {
			return new Response('Bucket binding not available', { status: 500 });
		}

		if (!objectKey) {
			return new Response('No object key specified', { status: 400 });
		}

		// Try to get the object
		let object;
		try {
			object = await bucket.get(objectKey);

			// If object not found and we're in development, explicitly try again
			if (!object && request.url.includes('localhost')) {
				try {
					console.log(`Object not found in local bucket, trying with key: ${objectKey}`);
					// Try again with different key variations
					if (objectKey.includes('/')) {
						// Try without path structure
						object = await bucket.get(objectKey.split('/').pop()!);
					} else {
						// Try with 'images/' prefix
						object = await bucket.get(`images/${objectKey}`);
					}
				} catch (e) {
					// Ignore errors in fallback attempt
				}
			}
		} catch (error) {
			console.error('Error fetching object:', error);
			// Continue to the 404 response below
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
