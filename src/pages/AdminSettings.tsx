import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminSettingsView } from "@/components/dashboard/admin/AdminSettingsView";

const AdminSettingsPage = () => {
  return (
    <AdminDashboardLayout>
      <AdminSettingsView />
    </AdminDashboardLayout>
  );
};

export default AdminSettingsPage;