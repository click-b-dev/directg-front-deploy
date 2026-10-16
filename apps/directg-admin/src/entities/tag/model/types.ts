// legacy tag/tag_group_list.php — TAG 그룹현황(3단계 계층 트리).

export type TagLeaf = {
  tag_code: string;
  tag_name: string;
};

export type TagSubGroup = {
  idx: number;
  tags_group_code: string;
  tags_group_name: string;
  tags: TagLeaf[];
};

export type TagTopGroup = {
  idx: number;
  tags_group_code: string;
  tags_group_name: string;
  subgroups: TagSubGroup[];
};

export type TagGroupTreeResponse = {
  groups: TagTopGroup[];
};

// legacy tag/tag_group_setting.php — 미분류 태그 그룹설정(getTagGroupNonList).
export type TagGroupNonItem = {
  idx: number;
  tag_name: string;
  tag_name_en: string;
  tag_group_code: string; // 통상 빈값(미분류). legacy $selected 미채움 → 사전선택 없음.
};
export type TagGroupNonListResponse = {
  items: TagGroupNonItem[];
};
// legacy tag_group_ps.php mode=tag_group_config.
export type AssignTagGroupRequest = {
  idx: number;
  tag_group_code: string;
};
