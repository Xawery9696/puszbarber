import { pb } from "@/lib/pocketbase";
import { F } from "@/lib/constants";

// Zdjęcia są chronione (Protected), więc do adresu potrzebny jest krótki token.
export async function getFileToken() {
  try {
    return await pb.files.getToken();
  } catch {
    return undefined;
  }
}

export function photoUrl(record, token) {
  const name = record?.[F.photo];
  if (!name) return null;
  return pb.files.getURL(record, name, token ? { token } : {});
}