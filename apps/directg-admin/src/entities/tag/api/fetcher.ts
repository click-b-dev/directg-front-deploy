import { apiClient } from "@shared/api/client";
import type {
  TagGroupTreeResponse,
  TagGroupNonListResponse,
  AssignTagGroupRequest,
} from "../model/types";

// legacy tag/tag_group_list.php — TAG 그룹 3단계 트리.
export const fetchTagGroupTree = () => apiClient.get<TagGroupTreeResponse>("/admin/tag/groups");

// legacy tag/tag_group_setting.php — 미분류 태그 목록.
export const fetchTagGroupNonList = () =>
  apiClient.get<TagGroupNonListResponse>("/admin/tag/unassigned");

// legacy tag_group_ps.php mode=tag_group_config — 태그 그룹 지정.
export const assignTagGroup = (payload: AssignTagGroupRequest) =>
  apiClient.post<{ success: boolean }>("/admin/tag/group-config", payload);
