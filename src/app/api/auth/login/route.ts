import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUser, SESSION_SECRET } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const user = findUser(username.trim());

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Incorrect username or password." },
        { status: 401 }
      );
    }

    // Build session value: base64(username:SECRET)
    const sessionValue = Buffer.from(`${user.username}:${SESSION_SECRET}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        trialStartDate: user.trialStartDate,
      },
    });

    response.cookies.set("tp_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("tp_user", user.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
