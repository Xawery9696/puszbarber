import { pb } from "@/lib/pocketbase";
import { F } from "@/lib/constants";
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