import { createFileRoute } from "@tanstack/react-router";
import { ChinaSalesYearScreen } from "@screens/china-sales-year";

// legacy pc/_Admin_/china/sales_china_year.php → /china/sales_china_year
export const Route = createFileRoute("/china/sales_china_year")({
  component: ChinaSalesYearScreen,
});
