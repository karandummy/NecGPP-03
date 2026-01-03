import { motion } from "framer-motion";
import ChangePasswordForm from "@components/auth/ChangePasswordForm";
import MainLayout from "@components/layout/MainLayout";

const ChangePasswordPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <ChangePasswordForm />
        </motion.div>
      </div>
    </MainLayout>
  );
};
export default ChangePasswordPage;
