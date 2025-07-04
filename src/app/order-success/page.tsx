import React, { Suspense } from "react";
import OrderSuccess from "@/components/OrderSuccess";

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <OrderSuccess />
        </Suspense>
    );
}

