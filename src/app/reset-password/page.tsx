import React, { Suspense } from "react";
import ResetPassword from "@/components/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPassword/>
    </Suspense>
  );
}
