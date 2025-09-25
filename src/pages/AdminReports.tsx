import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminReportsView } from "@/components/dashboard/admin/AdminReportsView";

const AdminReportsPage = () => {
  return (
    <AdminDashboardLayout>
      <AdminReportsView />
    </AdminDashboardLayout>
  );
};

export default AdminReportsPage;