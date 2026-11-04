import { pb } from "@/lib/pocketbase";

// Zdjęcia są chronione (Protected), więc do adresu potrzebny jest krótki token.
export async function getFileToken() {
  try {
    return await pb.files.getToken();
  } catch {
    return undefined;
  }
}

export function photoUrl(record, token) {
  if (!record?.photo) return null;
  return pb.files.getURL(record, record.photo, token ? { token } : {});
}
