import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminMarketingView } from "@/components/dashboard/admin/AdminMarketingView";

const AdminMarketingPage = () => {
  return (
    <AdminDashboardLayout>
      <AdminMarketingView />
    </AdminDashboardLayout>
  );
};

export default AdminMarketingPage;