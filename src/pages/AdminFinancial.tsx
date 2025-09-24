import { AdminDashboardLayout } from "@/components/dashboard/admin/AdminDashboardLayout";
import { AdminFinancialView } from "@/components/dashboard/admin/AdminFinancialView";

const AdminFinancialPage = () => {
  return (
    <AdminDashboardLayout>
      <AdminFinancialView />
    </AdminDashboardLayout>
  );
};

export default AdminFinancialPage;