import type { FaqRow } from "@entities/board-faq";

/**
 * 개발용 fixture — 백엔드(`GET /api/board/faqs`) 준비 전 주입.
 * legacy `tbl_faq` 행 형태. question_html/answer_html은 백엔드 Parsedown 렌더 결과 재현.
 * 정렬(faq_type asc)·질문 검색은 백엔드 책임.
 */
export const boardFaqsFixture: FaqRow[] = [
  {
    idx: 11,
    faq_type: "M01",
    question_html: "<p>회원가입은 어떻게 하나요?</p>",
    answer_html:
      "<p>이메일 주소 인증만으로 가입할 수 있으며, 네이버·카카오 간편 로그인도 지원합니다.</p>",
  },
  {
    idx: 12,
    faq_type: "O02",
    question_html: "<p>구매한 제품 코드(키)는 어디서 확인하나요?</p>",
    answer_html:
      "<p><strong>마이페이지 &gt; 주문완료 내역</strong>에서 수취확인 후 코드를 확인할 수 있습니다.</p>",
  },
  {
    idx: 13,
    faq_type: "O03",
    question_html: "<p>환불은 언제까지 가능한가요?</p>",
    answer_html:
      "<p>디지털상품은 제품 코드 활성화 전, 구매일로부터 7일 이내 단순변심 환불이 가능합니다.</p>",
  },
  {
    idx: 14,
    faq_type: "S03",
    question_html: "<p>스팀 게임은 어떻게 설치하나요?</p>",
    answer_html: "<p>스팀 클라이언트 설치 후 라이브러리에서 제품 코드를 등록하면 됩니다.</p>",
  },
];
