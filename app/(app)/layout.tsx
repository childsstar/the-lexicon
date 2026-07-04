import AppShell from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import AuthGuard from "@/components/auth-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>
        <AuthGuard>{children}</AuthGuard>
      </AppShell>
    </AuthProvider>
  );
}
