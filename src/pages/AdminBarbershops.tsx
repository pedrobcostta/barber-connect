import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminBarbershopsView } from "@/components/dashboard/admin/AdminBarbershopsView";

const AdminBarbershopsPage = () => {
  return (
    <AdminDashboardLayout>
      <AdminBarbershopsView />
    </AdminDashboardLayout>
  );
};

export default AdminBarbershopsPage;