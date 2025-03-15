"use client";
import ProtectedAdminPage from "@/components/admin/ProtectedAdminPage";
import React from "react";

const Admin = () => {
  return (
    <div className="h-screen">
      <ProtectedAdminPage />
    </div>
  );
};

export default Admin;
