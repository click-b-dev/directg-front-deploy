import { useQuery } from "@tanstack/react-query";
import { fetchGroupList } from "./fetcher";

const GROUP_KEY = ["admin", "goods", "groups"] as const;

export const groupListQueryKey = () => [...GROUP_KEY, "list"] as const;

// legacy goods/group/group_list.php — 그룹 현황.
export const useGroupList = () =>
  useQuery({
    queryKey: groupListQueryKey(),
    queryFn: () => fetchGroupList(),
  });
