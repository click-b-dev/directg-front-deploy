import { permanentRedirect } from "next/navigation";

/**
 * 모바일 customer/notice_view.html — legacy는 무조건 301 → `/board/notice.html`.
 * 관측 동작(공지 목록으로 영구 리다이렉트)만 재현(Next 308≈301).
 */
export default function MobileCustomerNoticeViewPage() {
  permanentRedirect("/board/notice");
}
