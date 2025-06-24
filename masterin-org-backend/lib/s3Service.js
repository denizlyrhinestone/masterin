// masterin-org-backend/lib/s3Service.js
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Configure the S3 client
// Ensure AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY are in .env
// S3_ENDPOINT_URL is optional for S3-compatible services
const s3ClientParams = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
};

if (process.env.S3_ENDPOINT_URL) {
  s3ClientParams.endpoint = process.env.S3_ENDPOINT_URL;
  s3ClientParams.forcePathStyle = true; // Often needed for S3-compatible services like MinIO
}

let s3Client;
if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client(s3ClientParams);
} else {
    console.warn("AWS S3 client not fully configured. Check AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables. S3 operations will likely fail.");
    // Provide a mock client or throw error if preferred, to prevent app from running with misconfigured S3
    s3Client = { send: async () => { throw new Error("S3 client is not configured.")}, destroy: () => {} };
}


const S3_BUCKET = process.env.S3_BUCKET_NAME;
const UPLOAD_URL_EXPIRATION_SECONDS = 300; // 5 minutes
const DOWNLOAD_URL_EXPIRATION_SECONDS = 300; // 5 minutes for GET, can be longer e.g. 7 days (604800) for actual content delivery

async function generatePresignedPutUrl(s3Key, mimeType) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET_NAME environment variable is not set.');
  if (!s3Client || typeof s3Client.send !== 'function') throw new Error('S3 client is not properly configured.');

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: mimeType,
    // ACL: 'private' // ACLs are generally not recommended for new buckets. Use bucket policies.
                      // If your bucket requires ACLs, you might set 'private' or 'public-read' etc.
    // Add other parameters like CacheControl, Expires, etc. if needed
  });
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_EXPIRATION_SECONDS });
    return url;
  } catch (error) {
    console.error("Error generating pre-signed PUT URL:", error);
    throw error;
  }
}

// New function to construct public S3 URLs (for publicly accessible objects)
function getPublicS3Url(s3Key) {
  if (!s3Key || !S3_BUCKET || !process.env.AWS_REGION) {
    console.warn(`getPublicS3Url: Missing s3Key, S3_BUCKET_NAME, or AWS_REGION. s3Key: ${s3Key}`);
    return null;
  }
  // Standard S3 URL format: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
  // For custom domains or CloudFront, this URL structure would be different.
  // Ensure bucket has public access configured OR use CloudFront for public content.
  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}

// Modified function to generate pre-signed GET URLs, with options for download/inline
async function generatePresignedGetUrl(s3Key, originalFileName, mimeType, expiresIn = DOWNLOAD_URL_EXPIRATION_SECONDS, inline = false) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET_NAME environment variable is not set.');
  if (!s3Client || typeof s3Client.send !== 'function') throw new Error('S3 client is not properly configured.');

  const commandParams = {
    Bucket: S3_BUCKET,
    Key: s3Key,
  };

  if (originalFileName && !inline) {
    // Forcing download with original filename
    commandParams.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(originalFileName)}"`;
  } else if (originalFileName && inline) {
    // Suggesting inline display with original filename (browser might still decide based on Content-Type)
    commandParams.ResponseContentDisposition = `inline; filename="${encodeURIComponent(originalFileName)}"`;
  }

  // Optionally set ResponseContentType if provided and useful (S3 usually infers this from upload)
  // if (mimeType) {
  //   commandParams.ResponseContentType = mimeType;
  // }

  const command = new GetObjectCommand(commandParams);
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating pre-signed GET URL:", error);
    throw error;
  }
}

async function getS3ObjectMetadata(s3Key) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET_NAME environment variable is not set.');
  if (!s3Client || typeof s3Client.send !== 'function') throw new Error('S3 client is not properly configured.');

  const command = new HeadObjectCommand({ Bucket: S3_BUCKET, Key: s3Key });
  try {
    const metadata = await s3Client.send(command);
    return {
        contentLength: metadata.ContentLength,
        contentType: metadata.ContentType,
        eTag: metadata.ETag,
        lastModified: metadata.LastModified,
        // metadata: metadata.Metadata // Custom metadata if set
    };
  } catch (error) {
    console.error(`Error fetching S3 object metadata for key ${s3Key}:`, error);
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return null; // Or throw custom error
    }
    throw error;
  }
}

module.exports = {
    s3Client, // Exporting client itself can be useful for direct S3 operations if needed
    generatePresignedPutUrl,
    getPublicS3Url, // Added new function
    generatePresignedGetUrl, // Modified function
    getS3ObjectMetadata,
    S3_BUCKET
};
