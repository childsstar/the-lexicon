import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseStorageKey } from "@/lib/supabase";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SupabaseStorage = {
  isServer?: boolean;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function redirectWithError(origin: string, message: string) {
  const url = new URL("/sign-in", origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

function getSafeNextPath(requestUrl: URL): string {
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    return redirectWithError(
      origin,
      errorDescription || `Discord authorization failed: ${error}`
    );
  }

  if (!code) {
    return redirectWithError(origin, "Discord did not return an OAuth code.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirectWithError(origin, "Supabase is not configured.");
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(
    new URL(getSafeNextPath(requestUrl), origin)
  );
  const storage: SupabaseStorage = {
    isServer: true,
    getItem(key) {
      return cookieStore.get(key)?.value ?? null;
    },
    setItem(key, value) {
      response.cookies.set(key, value, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        httpOnly: false,
        secure: requestUrl.protocol === "https:",
      });
    },
    removeItem(key) {
      response.cookies.set(key, "", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        httpOnly: false,
        secure: requestUrl.protocol === "https:",
      });
    },
  };

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      storageKey: getSupabaseStorageKey(supabaseUrl),
      flowType: "pkce",
    },
  });

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return redirectWithError(origin, exchangeError.message);
  }

  return response;
}
