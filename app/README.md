![Muse Frontend](/public/website.png)

# [Muse Frontend](https://museisfun.com)

> [!NOTE]
> This is the frontend entry point for the Muse application stack. For the backend entry point, [click here](../README.md).

Muse is a web application that allows users to upload songs and listen to them. The frontend is built with React, TypeScript, and Vite.

Unlike other music streaming services, Muse allows users to download their own music through YouTube and Soundcloud links, create playlists, and share them with others.

## Getting Started

### Prerequisites

- [Node.js >20.9.0](https://nodejs.org/)
- [NPM](https://www.npmjs.com/)
- [Bun](https://bun.sh/)

### Environment Variables

Create a `.env.local` file in the app directory and add the necessary environment variables.

```env
VITE_DEV_BASE_URL="http://localhost:3000" # Localhost
VITE_PROD_BASE_URL="https://api.museisfun.com" # Production
```

### Running the Frontend

1. **Install dependencies:**

    ```bash
    cd app
    bun install
    ```

2. **Start the development server:**

    ```bash
    bun dev
    ```

3. **Access the application:**

    Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

### Building for Production

```bash
bun build
```

### Testing workflow's locally (act)

```bash
brew install act
act -j build -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
```
