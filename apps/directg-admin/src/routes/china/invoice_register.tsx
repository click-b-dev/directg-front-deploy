import { createFileRoute } from "@tanstack/react-router";
import { ChinaInvoiceRegisterScreen } from "@screens/china-invoice-register";

// legacy pc/_Admin_/china/invoice_register.php → /china/invoice_register
// register 전용 이관. legacy mode=modify(=대입 버그 dead 경로)는 미재현(개발자 승인 2026-08-03).
export const Route = createFileRoute("/china/invoice_register")({
  component: ChinaInvoiceRegisterScreen,
});
