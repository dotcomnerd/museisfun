![API Docs Preview](/public/og.png)

# [api.museisfun.com](https://api.museisfun.com)

> [!NOTE]
> This is the backend entry point for the Muse application stack. For the frontend entry point, [click here](/app/README.md).

Muse is a web service that allows users to upload songs and listen to them in the browser.

Powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [SpotDL](https://github.com/spotDL/spotify-downloader), Muse is able to download music from YouTube, Soundcloud, and Spotify.

A cloud-based [frontend](https://museisfun.com) will soon be available, allowing you to manage your music library without having to locally host the Muse services yourself.

## Getting Started

### Prerequisites

#### Required

- [Docker](https://www.docker.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/get-started/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-wrangler/)
- [Node.js >= 23.6.0](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bun](https://bun.sh/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (extracts audio from YouTube and soundcloud sources)
- [SpotDL](https://github.com/spotDL/spotify-downloader) (extracts audio from Spotify sources)

#### Optional

- [MongoDB](https://www.mongodb.com/)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass) (helps visualize the collections)
- [openssl](https://www.openssl.org/) (helps generate JWT secret)
- [act](https://github.com/nektos/act) (helps run the tests)
- [ffmpeg](https://ffmpeg.org/) (helps convert audio formats)

### Environment Variables

Create an `.env.local` file in the root directory and add the following environment variables:

```env
PORT="3000"
JWT_SECRET="your_jwt_secret"
R2_ACCOUNT_ID="your_r2_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="your_r2_bucket_name"
PFP_BUCKET_NAME="your_pfp_bucket_name"
R2_ENDPOINT="your_r2_endpoint"
COVERS_BUCKET_NAME="your_covers_bucket_name"
CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"
MONGODB_URI_LOCAL="your_mongodb_uri_local"
MONGODB_URI_PROD="your_mongodb_uri_prod"
YOUTUBE_API_KEY="your_youtube_api_key"
NODE_ENV="development"
PROD_IMAGE_PROXY_URL="your_prod_image_proxy_url"
LOCAL_IMAGE_PROXY_URL="your_local_image_proxy_url"
```

### Running the Application

1. **Clone the repository:**

    ```bash
    git clone https://github.com/dotcomnerd/museisfun.git
    cd muse
    ```

2. **Start the development server:**

    ```bash
    docker-compose up -d
    npm run dev
    ```

3. **Access the application:**

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
    or
    `curl` the API health endpoint:

    ```bash
    curl http://localhost:3000/health -> OK
    ```

For the full API spec, head to the official [Muse API Documentation](https://api.museisfun.com).
