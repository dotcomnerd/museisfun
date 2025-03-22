import { GetObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

config({ path: ".env.local" });

const requiredEnvVars = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "PFP_BUCKET_NAME",
    "R2_ENDPOINT",
    "COVERS_BUCKET_NAME",
    "PROD_IMAGE_PROXY_URL",
    "LOCAL_IMAGE_PROXY_URL",
    "TEST_BUCKET_NAME",
];

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`${envVar} missing`);
        process.exit(1);
    }
});

// Initialize the S3 client for Cloudflare R2
// Using different endpoints for production vs development
export const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.NODE_ENV === "production"
        ? process.env.R2_ENDPOINT
        : "http://localhost:8787", // Use local Wrangler dev server in development
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// Create a production-only R2 client that always uses the production endpoint
export const ProductionR2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// For direct file uploads in local development, wrapper around S3 client
export async function uploadToR2({
    file,
    key,
    bucket,
    contentType
}: {
    file: Buffer,
    key: string,
    bucket: string,
    contentType?: string
}) {
    if (process.env.NODE_ENV !== "production") {
        // In local dev, always use the CLI method which is more reliable
        try {
            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), "temp");
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Write file to temp directory with just the base filename
            const tempFileName = path.basename(key);
            const tempFilePath = path.join(tempDir, tempFileName);
            fs.writeFileSync(tempFilePath, file);

            console.log(`Saved temp file to ${tempFilePath}`);

            // Use execSync directly with a relative path from the proxy directory
            const result = execSync(
                `cd proxy && npx wrangler r2 object put muse-test/${key} --file ../temp/${tempFileName}`,
                { encoding: "utf8" }
            );
            console.log("CLI upload result:", result);

            // Clean up temp file
            fs.unlinkSync(tempFilePath);
            return { success: true };
        } catch (cliError) {
            console.error("Error using CLI upload:", cliError);
            return { success: false, error: cliError };
        }
    } else {
        // In production, use the normal R2 client
        try {
            await R2.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: file,
                    ContentType: contentType,
                })
            );
            return { success: true };
        } catch (error) {
            console.error("Error uploading to R2:", error);
            return { success: false, error };
        }
    }
}

// Delete files from R2 storage
export async function deleteFromR2({
    key,
    bucket
}: {
    key: string,
    bucket: string
}) {
    if (process.env.NODE_ENV !== "production") {
        // In local dev, use CLI to delete from local simulator
        try {
            // Use wrangler CLI to delete the object
            const result = execSync(
                `cd proxy && npx wrangler r2 object delete muse-test/${key}`,
                { encoding: "utf8" }
            );
            console.log("CLI delete result:", result);
            return { success: true };
        } catch (cliError) {
            console.error("Error using CLI delete:", cliError);
            return { success: false, error: cliError };
        }
    } else {
        // In production, use the normal R2 client
        try {
            await R2.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: key,
                })
            );
            return { success: true };
        } catch (error) {
            console.error("Error deleting from R2:", error);
            return { success: false, error };
        }
    }
}

// Extract key from a proxy URL
export function extractKeyFromProxyUrl(proxyUrl: string): string | null {
    try {
        const url = new URL(proxyUrl);
        const pathParts = url.pathname.split('/').filter(p => p);

        // Skip the bucket name (first part) and return the rest as the key
        if (pathParts.length >= 2) {
            return pathParts.slice(1).join('/');
        }
        return null;
    } catch (error) {
        console.error("Error extracting key from URL:", error);
        return null;
    }
}

interface PresignedUrlParams {
    key: string;
    expiresIn?: number;
    bucket: string;
}

interface ProxyUrlParams {
    key: string;
    bucket: string;
}

export async function getPresignedUrl({
    key,
    bucket,
    expiresIn = 3600,
}: PresignedUrlParams): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        // For song files, always use the production endpoint to generate presigned URLs
        if (bucket === BUCKET_NAME) {
            return await getSignedUrl(ProductionR2, command, { expiresIn });
        }

        // For other files, use the environment-specific R2 client
        const url = await getSignedUrl(R2, command, { expiresIn });
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return "";
    }
}

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const PFP_BUCKET_NAME = process.env.PFP_BUCKET_NAME!;
export const COVERS_BUCKET_NAME = process.env.COVERS_BUCKET_NAME!;
export const TEST_BUCKET_NAME = process.env.TEST_BUCKET_NAME!;

export function getProxyUrl({ key, bucket }: ProxyUrlParams): string {
    // Song files and thumbnails should not use the proxy
    if (bucket === BUCKET_NAME) {
        // Let the songs be handled by getPresignedUrl
        // This should not be called directly for song files
        console.warn('getProxyUrl should not be used for song files');
        return '';
    }

    // For non-song files (profile pics, covers, etc.), use the proxy system
    const baseUrl = process.env.NODE_ENV === "production"
        ? process.env.PROD_IMAGE_PROXY_URL
        : process.env.LOCAL_IMAGE_PROXY_URL;

    // In development, use muse-test bucket for non-song assets
    // In production, use the bucket name directly without adding "muse-" prefix again
    const bucketName = process.env.NODE_ENV === "production"
        ? bucket  // Use bucket name directly without adding "muse-" prefix
        : "muse-test";

    // Return the full URL
    return `${baseUrl}/${bucketName}/${key}`;
}
