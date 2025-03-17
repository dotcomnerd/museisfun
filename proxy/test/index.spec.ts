import { createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
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

	async list() {
		return {
			objects: [
				{
					key: 'test.jpg',
					size: 12,
					etag: '"test-etag"',
				},
			],
			truncated: false,
			cursor: '',
		};
	}
}

const mockEnv = {
	TEST_BUCKET: new MockR2Bucket(),
};

describe('R2 Image Proxy', () => {
	it('responds with service message on root path', async () => {
		const request = new IncomingRequest('http://localhost');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		const text = await response.text();
		expect(text).toBe('Image Proxy Service');
		expect(response.headers.get('Content-Type')).toBe('text/plain');
	});

	it('returns 400 for invalid image path', async () => {
		const request = new IncomingRequest('http://localhost/images');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
	});

	it('returns 400 for invalid key prefix', async () => {
		const request = new IncomingRequest('http://localhost/images/invalid/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
	});

	it('returns 404 for non-existent image', async () => {
		const request = new IncomingRequest('http://localhost/images/test/not-found.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(404);
	});

	it('returns 200 with correct headers for test.jpg', async () => {
		const request = new IncomingRequest('http://localhost/images/test.jpg');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv as any);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('image/jpeg');
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
