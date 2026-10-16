import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy tag/tag_group_list.php — TAG 그룹 3단계 트리(대분류→중분류→태그).
const TAG_GROUP_TREE = {
  groups: [
    {
      idx: 1,
      tags_group_code: "G",
      tags_group_name: "장르",
      subgroups: [
        {
          idx: 11,
          tags_group_code: "G01",
          tags_group_name: "액션",
          tags: [
            { tag_code: "G0101", tag_name: "핵앤슬래시" },
            { tag_code: "G0102", tag_name: "플랫포머" },
            { tag_code: "G0103", tag_name: "벨트스크롤" },
          ],
        },
        {
          idx: 12,
          tags_group_code: "G02",
          tags_group_name: "RPG",
          tags: [
            { tag_code: "G0201", tag_name: "JRPG" },
            { tag_code: "G0202", tag_name: "액션RPG" },
          ],
        },
        {
          idx: 13,
          tags_group_code: "G03",
          tags_group_name: "시뮬레이션",
          tags: [{ tag_code: "G0301", tag_name: "경영" }],
        },
      ],
    },
    {
      idx: 2,
      tags_group_code: "M",
      tags_group_name: "분위기/세계관",
      subgroups: [
        {
          idx: 21,
          tags_group_code: "M01",
          tags_group_name: "판타지",
          tags: [
            { tag_code: "M0101", tag_name: "다크판타지" },
            { tag_code: "M0102", tag_name: "하이판타지" },
          ],
        },
        {
          idx: 22,
          tags_group_code: "M02",
          tags_group_name: "SF",
          tags: [{ tag_code: "M0201", tag_name: "사이버펑크" }],
        },
      ],
    },
    {
      idx: 3,
      tags_group_code: "V",
      tags_group_name: "시점/그래픽",
      subgroups: [
        {
          idx: 31,
          tags_group_code: "V01",
          tags_group_name: "시점",
          tags: [
            { tag_code: "V0101", tag_name: "1인칭" },
            { tag_code: "V0102", tag_name: "3인칭" },
            { tag_code: "V0103", tag_name: "쿼터뷰" },
          ],
        },
      ],
    },
  ],
};

// legacy tag/tag_group_setting.php — 미분류 태그(getTagGroupNonList).
const TAG_GROUP_NON_LIST = [
  { idx: 501, tag_name: "핵앤슬래시", tag_name_en: "Hack and Slash", tag_group_code: "" },
  { idx: 502, tag_name: "로그라이크", tag_name_en: "Roguelike", tag_group_code: "" },
  { idx: 503, tag_name: "오픈월드", tag_name_en: "Open World", tag_group_code: "" },
  { idx: 504, tag_name: "협동", tag_name_en: "Co-op", tag_group_code: "" },
  { idx: 505, tag_name: "픽셀 그래픽", tag_name_en: "Pixel Graphics", tag_group_code: "" },
];

export const tagHandlers = [
  // legacy tag/tag_group_list.php — TAG 그룹 트리.
  http.get(api("/admin/tag/groups"), () => HttpResponse.json(TAG_GROUP_TREE)),

  // legacy tag/tag_group_setting.php — 미분류 태그 목록.
  http.get(api("/admin/tag/unassigned"), () => HttpResponse.json({ items: TAG_GROUP_NON_LIST })),

  // legacy tag_group_ps.php mode=tag_group_config — 태그 그룹 지정.
  http.post(api("/admin/tag/group-config"), async ({ request }) => {
    await request.json().catch(() => ({}));
    return HttpResponse.json({ success: true });
  }),
];
