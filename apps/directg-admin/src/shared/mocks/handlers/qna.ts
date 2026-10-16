import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type QnaRow = {
  idx: number;
  gubun: string;
  subject: string;
  contents: string; // 필터용(목록 미표시)
  user_id: string;
  reg_date: string;
  answer: string;
  admin_id: string;
  is_answer: "Y" | "N"; // 답변상태 필터
  replyStatus: string; // "0"|"1"
  email_flag: string; // "Y"|""
  file_cnt: number;
};

// legacy directgames.tbl_qna 재현(삭제 반영 위해 mutable).
let QNA_LIST: QnaRow[] = [
  {
    idx: 5821,
    gubun: "5",
    subject: "구매한 제품 코드가 오류납니다",
    contents: "스팀에 코드 등록 시 오류가 발생합니다.",
    user_id: "gamer01",
    reg_date: "2026-07-24 18:22:10",
    answer: "",
    admin_id: "",
    is_answer: "N",
    replyStatus: "0",
    email_flag: "",
    file_cnt: 1,
  },
  {
    idx: 5814,
    gubun: "2",
    subject: "결제가 두 번 되었어요",
    contents: "카드로 결제했는데 두 번 청구되었습니다.",
    user_id: "buyer_kim",
    reg_date: "2026-07-23 11:05:44",
    answer: "확인 결과 정상 1건 결제이며, 승인대기 건은 자동 취소됩니다.",
    admin_id: "admin@h2int.com",
    is_answer: "Y",
    replyStatus: "1",
    email_flag: "Y",
    file_cnt: 0,
  },
  {
    idx: 5799,
    gubun: "7",
    subject: "한글패치 적용 방법 문의",
    contents: "한글패치가 적용되지 않습니다.",
    user_id: "hangeul",
    reg_date: "2026-07-22 09:31:00",
    answer: "상품 상세의 한글패치 안내를 참고해 주세요.",
    admin_id: "admin@h2int.com",
    is_answer: "Y",
    replyStatus: "0",
    email_flag: "",
    file_cnt: 2,
  },
  {
    idx: 5780,
    gubun: "6",
    subject: "본인인증이 계속 실패합니다",
    contents: "휴대폰 본인인증이 안 됩니다.",
    user_id: "user_lee",
    reg_date: "2026-07-20 14:47:20",
    answer: "",
    admin_id: "",
    is_answer: "N",
    replyStatus: "0",
    email_flag: "",
    file_cnt: 0,
  },
  {
    idx: 5762,
    gubun: "4",
    subject: "환불 신청했는데 처리가 안 돼요",
    contents: "환불 요청 후 3일째 답이 없습니다.",
    user_id: "refund_me",
    reg_date: "2026-07-18 20:10:05",
    answer: "환불 처리 완료되었습니다. 3~5영업일 내 입금됩니다.",
    admin_id: "admin@h2int.com",
    is_answer: "Y",
    replyStatus: "1",
    email_flag: "Y",
    file_cnt: 0,
  },
  {
    idx: 5741,
    gubun: "1",
    subject: "게임이 실행되지 않습니다",
    contents: "설치 후 실행 시 튕깁니다.",
    user_id: "player9",
    reg_date: "2026-07-15 08:00:00",
    answer: "",
    admin_id: "",
    is_answer: "N",
    replyStatus: "0",
    email_flag: "",
    file_cnt: 0,
  },
];

// 회원 조회(getMemberNo/getMemberInfo) 재현. email 없으면 폴백(hangeul).
const MEMBER_MAP: Record<string, { m_no: number; email: string }> = {
  gamer01: { m_no: 10001, email: "gamer01@example.com" },
  buyer_kim: { m_no: 10002, email: "kim@example.com" },
  hangeul: { m_no: 10003, email: "" },
  user_lee: { m_no: 10004, email: "lee@example.com" },
  refund_me: { m_no: 10005, email: "refund@example.com" },
  player9: { m_no: 10006, email: "player9@example.com" },
};

// tbl_file(table_name=tbl_qna, puid=idx) 재현.
const FILES_MAP: Record<number, { filename: string; reg_date: string }[]> = {
  5821: [{ filename: "code_error.png", reg_date: "2026-07-24 18:22:10" }],
  5799: [
    { filename: "patch_step1.png", reg_date: "2026-07-22 09:31:00" },
    { filename: "patch_step2.png", reg_date: "2026-07-22 09:31:00" },
  ],
};

// nl2br + htmlspecialchars_decode 근사(백엔드 책임, mock 근사치).
const nl2brDecode = (text: string) => text.replace(/\n/g, "<br />\n");

const PER_PAGE_QNA = 30;

export const qnaHandlers = [
  // legacy board/qna_list.php — 문의하기 목록(idx DESC, 30/page).
  http.get(api("/admin/board/qnas"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = [...QNA_LIST];

    const gubun = q("searchGubun");
    if (gubun) {
      rows = rows.filter((r) => r.gubun === gubun); // gubun like {n} → 등호
    }
    const isAnswer = q("is_answer");
    if (isAnswer) {
      rows = rows.filter((r) => r.is_answer === isAnswer);
    }
    const replyStatus = q("replyStatus");
    if (replyStatus) {
      rows = rows.filter((r) => r.replyStatus === replyStatus);
    }
    const emailFlag = q("email_flag");
    if (emailFlag === "Y") {
      rows = rows.filter((r) => r.email_flag === "Y");
    } else if (emailFlag === "N") {
      rows = rows.filter((r) => r.email_flag === "");
    }
    const searchTitle = q("searchTitle");
    const searchType = q("searchType");
    if (searchTitle && searchType) {
      if (searchType === "subject") {
        rows = rows.filter((r) => r.subject.includes(searchTitle));
      } else if (searchType === "user_id") {
        rows = rows.filter((r) => r.user_id.includes(searchTitle));
      } else if (searchType === "contents") {
        rows = rows.filter((r) => r.contents.includes(searchTitle));
      } else {
        // subject_contents: legacy broken(존재하지 않는 컬럼 LIKE) → 빈 결과로 근사.
        rows = [];
      }
    }

    rows.sort((a, b) => b.idx - a.idx); // idx DESC

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_QNA));
    const start = (page - 1) * PER_PAGE_QNA;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_QNA).map((r) => ({
        idx: r.idx,
        gubun: r.gubun,
        subject: r.subject,
        user_id: r.user_id,
        reg_date: r.reg_date,
        answer: r.answer,
        admin_id: r.admin_id,
        replyStatus: r.replyStatus,
        email_flag: r.email_flag,
        file_cnt: r.file_cnt,
      })),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_QNA,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy qna_view.php — 문의 상세(회원·첨부·이력 포함).
  http.get(api("/admin/board/qnas/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = QNA_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    const member = MEMBER_MAP[row.user_id] ?? { m_no: 0, email: "" };
    const history = QNA_LIST.filter((r) => r.user_id === row.user_id)
      .sort((a, b) => b.idx - a.idx)
      .map((r) => ({
        idx: r.idx,
        gubun: r.gubun,
        subject: r.subject,
        user_id: r.user_id,
        reg_date: r.reg_date,
        is_answer: r.is_answer,
        admin_id: r.admin_id,
      }));
    return HttpResponse.json({
      idx: row.idx,
      user_id: row.user_id,
      subject: row.subject,
      reg_date: row.reg_date,
      gubun: row.gubun,
      contents_html: nl2brDecode(row.contents),
      answer: row.answer,
      answer_html: nl2brDecode(row.answer),
      replyStatus: row.replyStatus,
      email_flag: row.email_flag,
      is_answer: row.is_answer,
      admin_id: row.admin_id,
      member,
      files: FILES_MAP[idx] ?? [],
      history,
    });
  }),

  // legacy qna_ps.php mode=mail — 문의답변 메일 발송(성공 시 email_flag='Y').
  http.post(api("/admin/board/qnas/:idx/mail"), async ({ params, request }) => {
    const idx = Number(params.idx);
    await request.json().catch(() => ({}));
    const row = QNA_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false, message: "메일발송 실패" });
    }
    row.email_flag = "Y";
    return HttpResponse.json({ success: true, message: "메일발송 성공" });
  }),

  // legacy qna_ps.php mode=update — 답변 저장(answer/answer_dt/admin_id/is_answer=Y).
  http.post(api("/admin/board/qnas/:idx/answer"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as { answer?: string };
    const row = QNA_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.answer = body.answer ?? "";
    row.is_answer = "Y";
    row.admin_id = "admin@h2int.com";
    return HttpResponse.json({ success: true });
  }),

  // legacy qna_ps.php mode=delete — 다중 삭제(FIND_IN_SET).
  http.post(api("/admin/board/qnas/delete"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { idx?: number[] };
    const ids = new Set((body.idx ?? []).map(Number));
    const before = QNA_LIST.length;
    QNA_LIST = QNA_LIST.filter((r) => !ids.has(r.idx));
    return HttpResponse.json({ success: true, deleted: before - QNA_LIST.length });
  }),
];
