import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthorizationError } from "@/modules/users/server/admin-types";
import { requireAdminAccess } from "@/modules/users/server/admin-service";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireAdminAccess();
  } catch (error) {
    if (error instanceof AdminAuthorizationError) redirect("/");
    throw error;
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[15rem_1fr]">
      <AdminSidebar />
      <main className="min-w-0 bg-stone-100">{children}</main>
    </div>
  );
}
