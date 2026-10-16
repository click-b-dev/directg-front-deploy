import { apiClient } from "@shared/api/client";
import type { GroupListResponse } from "../model/types";

// legacy goods/group/group_list.php — 그룹 목록.
export const fetchGroupList = () => apiClient.get<GroupListResponse>("/admin/goods/groups");
