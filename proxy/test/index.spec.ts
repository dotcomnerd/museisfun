import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

class MockR2Bucket {
	async get(key: string) {
		if (key === 'test.jpg') {
			return {
				body: new ReadableStream({
					start(controller) {
						const testImage = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
						controller.enqueue(testImage);
						controller.close();
					},
				}),
				httpEtag: '"test-etag"',
				writeHttpMetadata: (headers: Headers) => {
					headers.set('Content-Type', 'image/jpeg');
				},
			};
		}
		return null;
	}
}

const mockEnv = {
	SONGS_BUCKET: new MockR2Bucket(),
	COVERS_BUCKET: new MockR2Bucket(),
	PFP_BUCKET: new MockR2Bucket(),
	TEST_BUCKET: new MockR2Bucket(),
};

describe('R2 Image Proxy', () => {
	it('responds with service message on root path', async () => {
		const request = new IncomingRequest('http://localhost/');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		const text = await response.text();
		expect(text).toBe('Image Proxy Service');
		expect(response.headers.get('Content-Type')).toBe('text/plain');
	});

	it('handles development mode with test bucket', async () => {
		const request = new IncomingRequest('http://localhost:8787/images/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('image/jpeg');
	});

	it('returns 404 for non-existent image', async () => {
		const request = new IncomingRequest('http://localhost/images/nonexistent.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(404);
		const text = await response.text();
		expect(text).toBe('Object Not Found');
	});

	it('returns 200 with correct headers for existing image', async () => {
		const request = new IncomingRequest('http://localhost/images/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('image/jpeg');
		expect(response.headers.get('etag')).toBe('"test-etag"');
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

		const buffer = await response.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		expect(bytes[0]).toBe(0xff);
		expect(bytes[1]).toBe(0xd8);
	});

	it('handles production bucket routing correctly', async () => {
		const request = new IncomingRequest('https://proxy.museisfun.com/muse-covers/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('image/jpeg');
	});

	it('returns 400 for invalid bucket in production', async () => {
		const request = new IncomingRequest('https://proxy.museisfun.com/invalid-bucket/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
		const text = await response.text();
		expect(text).toBe('Invalid bucket');
	});
});
