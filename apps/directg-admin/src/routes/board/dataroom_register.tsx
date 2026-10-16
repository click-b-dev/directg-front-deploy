import { createFileRoute } from "@tanstack/react-router";
import { DataroomRegisterScreen, type DataroomRegisterSearch } from "@screens/dataroom-register";

// legacy pc/_Admin_/board/dataroom_register.php → /board/dataroom_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const DataroomRegisterRoute = () => {
  const search = Route.useSearch();
  return <DataroomRegisterScreen {...search} />;
};

export const Route = createFileRoute("/board/dataroom_register")({
  validateSearch: (search: Record<string, unknown>): DataroomRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
  }),
  component: DataroomRegisterRoute,
});
