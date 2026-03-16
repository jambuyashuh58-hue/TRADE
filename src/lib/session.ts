import { NextRequest } from "next/server";
import { SESSION_SECRET, findUser, AppUser } from "@/lib/config";

export async function getSessionUser(req: NextRequest): Promise<AppUser | null> {
  try {
    const cookie = req.cookies.get("tp_session")?.value;
    if (!cookie) return null;
    const decoded = Buffer.from(cookie, "base64").toString("utf-8");
    const [username, secret] = decoded.split(":");
    if (secret !== SESSION_SECRET) return null;
    return findUser(username) ?? null;
  } catch { return null; }
}
