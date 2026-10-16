import type { QnaRow } from "@entities/mypage-qna";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/qna`) 준비 전 주입.
 * legacy `tbl_qna`(user_id=세션회원) 행 형태. contents_html/answer_html은 백엔드 렌더 결과 재현.
 */
export const mypageQnaFixture: QnaRow[] = [
  {
    idx: 305,
    gubun: "5",
    subject: "구매한 제품 코드가 이미 사용됨으로 표시됩니다.",
    reg_date: "2026-08-25 14:20:00",
    is_answer: "Y",
    contents_html:
      "<p>스팀에 코드를 등록하려는데 이미 사용된 코드라고 나옵니다. 확인 부탁드립니다.</p>",
    answer_html:
      "<p>확인 결과 정상 코드이며, 계정 지역 설정 문제로 확인됩니다. 고객센터에서 재발급 처리해 드렸습니다.</p>",
  },
  {
    idx: 298,
    gubun: "2",
    subject: "네이버페이 결제가 중복으로 되었습니다.",
    reg_date: "2026-08-10 09:05:00",
    is_answer: "Y",
    contents_html: "<p>결제 버튼을 두 번 눌렀더니 두 건이 결제된 것 같습니다.</p>",
    answer_html: "<p>중복 결제 1건은 취소 처리되었으며, 영업일 기준 3~5일 내 환불됩니다.</p>",
  },
  {
    idx: 291,
    gubun: "9",
    subject: "선물하기 기능은 어떻게 사용하나요?",
    reg_date: "2026-07-30 18:40:00",
    is_answer: "N",
    contents_html: "<p>친구에게 게임을 선물하고 싶은데 방법을 모르겠습니다.</p>",
    answer_html: "",
  },
];
