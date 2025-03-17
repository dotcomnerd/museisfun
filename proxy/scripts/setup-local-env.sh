#!/bin/bash

# This script helps set up the local development environment for the R2 proxy worker
# It creates test images and uploads them to the local R2 buckets

set -e # Exit on error

echo "Setting up local development environment for R2 proxy..."

# Create temp directory for storing test images
mkdir -p temp

# Generate simple test images
echo "Generating test images..."

# Base64-encoded 1x1 pixel JPEG image
echo "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AP/8A/9k=" | base64 --decode > temp/test.jpg

# You can generate more test images for each bucket if needed

echo "Uploading test images to local R2 buckets..."

# Make sure wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler command not found. Install it with 'npm install -g wrangler'"
    exit 1
fi

echo "Uploading to TEST_BUCKET..."
wrangler r2 object put muse-test/test.jpg --file=temp/test.jpg --local

echo "Cleanup..."
rm -rf temp

echo ""
echo "✅ Local environment setup complete!"
echo ""
echo "Start the local development server with:"
echo "cd proxy && npm run dev"
echo ""
echo "Test the proxy with:"
echo "curl http://localhost:8787/images/test.jpg -o test.jpg"
echo "curl http://localhost:8787/images/covers/example.jpg -o covers.jpg"
echo ""
