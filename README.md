![API Docs Preview](/public/og.png)

# [api.museisfun.com](https://api.museisfun.com)

> [!NOTE]
> This is the backend entry point for the Muse application stack. For the frontend entry point, [click here](/app/README.md).

Muse is a web service that allows users to upload songs and listen to them in the browser.

Powered by [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [SpotDL](https://github.com/spotDL/spotify-downloader), Muse is able to download music from YouTube, Soundcloud, and Spotify.

There's also a [frontend](https://museisfun.com) that allows you to manage your music library. (PWA coming soon)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/get-started/)
- [Node.js >23.9.0](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bun](https://bun.sh/)
- [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB](https://www.mongodb.com/) (optional, for local development)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass) (optional, helps visualize the collections)
- [openssl](https://www.openssl.org/) (optional, helps generate JWT secret)

### Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

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
