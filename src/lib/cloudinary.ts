import { CLOUDINARY_CONFIG } from './firebase';

export async function uploadJSONToCloudinary(filename: string, data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('public_id', `${CLOUDINARY_CONFIG.folderPrefix}${filename.replace('.json', '')}`);
  // Removed invalidate and overwrite as they cause unsigned upload to fail.
  // formData.append('invalidate', 'true');
  // formData.append('overwrite', 'true');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary response error:', errorText);
        throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function fetchJSONFromCloudinary(filename: string): Promise<any> {
    const url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/v1/${CLOUDINARY_CONFIG.folderPrefix}${filename}?t=${Date.now()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // File might not exist yet
            if (response.status === 404) return null;
            throw new Error('Failed to fetch from Cloudinary');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching from Cloudinary:', error);
        return null;
    }
}
