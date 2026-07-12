import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];
export type ImageUploadFolder =
  | "images/events"
  | "images/avatars"
  | "images/organizers";

interface PresignUploadResponse {
  uploadUrl: string;
  key: string;
}

const API_VERSION = "v1";
const MAX_UPLOAD_ATTEMPTS = 2;

class DirectUploadError extends Error {
  constructor() {
    super("Image upload failed. Please try again.");
    this.name = "DirectUploadError";
  }
}

export const isAllowedImageContentType = (
  contentType: string,
): contentType is AllowedImageContentType =>
  ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType);

const presignImageUpload = async (
  file: File,
  folder: ImageUploadFolder,
): Promise<PresignUploadResponse> => {
  const res = await axios.post<PresignUploadResponse>(
    buildEndpoint(API_VERSION, "uploads/presign"),
    {
      filename: file.name,
      contentType: file.type,
      folder,
    },
  );

  return res.data;
};

const putImageToPresignedUrl = async (
  uploadUrl: string,
  file: File,
): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) {
    throw new DirectUploadError();
  }
};

export async function uploadImageToS3(
  file: File,
  folder: ImageUploadFolder,
): Promise<string> {
  if (!isAllowedImageContentType(file.type)) {
    throw new Error("Please upload a JPEG, PNG, or WebP image.");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      const { uploadUrl, key } = await presignImageUpload(file, folder);
      await putImageToPresignedUrl(uploadUrl, file);
      return key;
    } catch (error) {
      lastError =
        error instanceof TypeError ? new DirectUploadError() : error;
    }
  }

  if (lastError instanceof DirectUploadError) {
    throw lastError;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Image upload failed. Please try again.");
}
