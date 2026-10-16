// legacy goods/group/group_list.php — 그룹 현황(getGroupList).

export type GroupItem = {
  idx: number;
  type: string; // 1 프로모션 | 2 타임딜 | 3 프랜차이즈 | 99 기타
  subject: string;
  start_date: number; // unix timestamp(초)
  end_date: number; // unix timestamp(초)
  use_flag: string;
  pc_banner_url: string;
  banner_url: string;
};

export type GroupListResponse = {
  items: GroupItem[];
};
