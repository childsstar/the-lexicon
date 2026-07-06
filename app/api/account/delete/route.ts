import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClients(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authorization = request.headers.get("authorization") ?? "";

  if (!url || !anonKey) throw new Error("Supabase is not configured.");
  if (!serviceRoleKey) {
    throw new Error("Supabase service role key is not configured.");
  }

  return {
    userClient: createClient(url, anonKey, {
      global: { headers: authorization ? { authorization } : {} },
      auth: { persistSession: false },
    }),
    adminClient: createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

async function deleteUserOwnedData(
  userClient: ReturnType<typeof createClient<any>>,
  userId: string
) {
  const { error } = await userClient.rpc("delete_account_owned_data", {
    target_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  let clients: ReturnType<typeof getSupabaseClients>;
  try {
    clients = getSupabaseClients(request);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const { data: userData, error: userError } =
    await clients.userClient.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before deleting your account." }, { status: 401 });
  }

  try {
    await deleteUserOwnedData(clients.userClient, userData.user.id);
    const { error: deleteError } =
      await clients.adminClient.auth.admin.deleteUser(userData.user.id);
    if (deleteError) throw new Error(deleteError.message);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Account deletion failed.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
