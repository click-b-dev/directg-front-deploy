import type { DataroomItem } from "@entities/board-dataroom";

/**
 * 개발용 fixture — 백엔드(`GET /api/board/dataroom`) 준비 전 주입.
 * legacy `tbl_dataroom`(is_free='Y', is_view='Y') 행 형태. 정렬(reg_date DESC)은 백엔드 책임.
 */
export const boardDataroomFixture: DataroomItem[] = [
  {
    idx: 21,
    file_name: "다이렉트 게임즈 브랜드 월페이퍼 (4K)",
    file_url: "https://mega.io/file/sample-wallpaper-4k",
    thumbnail: "wallpaper_4k_thumb.jpg",
    contents: "3840x2160 · PNG",
    deploy_date: "2026-08-20",
  },
  {
    idx: 19,
    file_name: "여름 프로모션 기념 월페이퍼",
    file_url: "https://mega.io/file/sample-summer",
    thumbnail: "summer_thumb.jpg",
    contents: "1920x1080 · JPG",
    deploy_date: "2026-07-01",
  },
  {
    idx: 15,
    file_name: "다이렉트 게임즈 캐릭터 아트팩",
    file_url: "https://mega.io/file/sample-artpack",
    thumbnail: "artpack_thumb.jpg",
    contents: "ZIP · 12MB",
    deploy_date: "2026-05-15",
  },
];
