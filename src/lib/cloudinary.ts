import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_FOLDER } from "./firebase";

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
const CLOUDINARY_FETCH_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

export async function uploadJSONToCloudinary(
  data: any,
  publicId: string
): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, `${publicId}.json`);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("public_id", `${CLOUDINARY_FOLDER}/${publicId}`);
  formData.append("resource_type", "raw");
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.statusText}`);
  const result = await res.json();
  return result.secure_url;
}

export async function fetchJSONFromCloudinary(publicId: string): Promise<any> {
  const cacheBuster = `?t=${Date.now()}`;
  const url = `${CLOUDINARY_FETCH_URL}/${CLOUDINARY_FOLDER}/${publicId}.json${cacheBuster}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cloudinary fetch failed: ${res.statusText}`);
  return res.json();
}
