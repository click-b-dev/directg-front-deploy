import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTagGroupTree, fetchTagGroupNonList, assignTagGroup } from "./fetcher";
import type { AssignTagGroupRequest } from "../model/types";

const TAG_KEY = ["admin", "tag"] as const;

export const tagGroupTreeQueryKey = () => [...TAG_KEY, "groups"] as const;

// legacy tag/tag_group_list.php — TAG 그룹현황.
export const useTagGroupTree = () =>
  useQuery({
    queryKey: tagGroupTreeQueryKey(),
    queryFn: () => fetchTagGroupTree(),
  });

export const tagGroupNonListQueryKey = () => [...TAG_KEY, "unassigned"] as const;

// legacy tag/tag_group_setting.php — 미분류 태그 목록.
export const useTagGroupNonList = () =>
  useQuery({
    queryKey: tagGroupNonListQueryKey(),
    queryFn: () => fetchTagGroupNonList(),
  });

// legacy tag_group_ps.php tag_group_config → location.reload = 목록 invalidate.
export const useAssignTagGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignTagGroupRequest) => assignTagGroup(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagGroupNonListQueryKey() }),
  });
};
