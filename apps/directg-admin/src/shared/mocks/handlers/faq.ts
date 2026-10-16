import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type FaqRow = {
  idx: number;
  faq_type: string;
  question: string;
  answer: string; // 마크다운 원문
};

type FaqSaveBody = {
  faq_type: string;
  question: string;
  answer: string;
};

// legacy board/faq_list.php — tbl_faq 재현(수정 반영 위해 mutable).
const FAQ_LIST: FaqRow[] = [
  {
    idx: 312,
    faq_type: "M01",
    question: "회원 가입은 어떻게 하나요?",
    answer: "우측 상단 **회원가입** 버튼을 눌러 진행하실 수 있습니다.",
  },
  {
    idx: 305,
    faq_type: "O02",
    question: "제품 코드(키)는 어디서 확인하나요?",
    answer: "## 확인 방법\n\n마이페이지 > 주문내역에서 확인할 수 있습니다.",
  },
  {
    idx: 298,
    faq_type: "O03",
    question: "결제 취소 및 환불은 언제 가능한가요?",
    answer: "코드 미확인 상태에 한해 취소가 가능합니다.",
  },
  {
    idx: 271,
    faq_type: "G04",
    question: "한글패치는 어떻게 적용하나요?",
    answer: "상품 상세의 한글패치 안내를 참고해 주세요.",
  },
  {
    idx: 240,
    faq_type: "S03",
    question: "게임 설치가 되지 않습니다.",
    answer: "Steam 클라이언트를 최신 버전으로 업데이트 후 다시 시도해 주세요.",
  },
  {
    idx: 155,
    faq_type: "E01",
    question: "기타 문의는 어디로 하나요?",
    answer: "1:1 문의하기를 이용해 주세요.",
  },
];

const PER_PAGE_FAQ = 30;

// answer_html — legacy Parsedown 렌더 근사(백엔드 책임, mock 근사치).
const mdToHtml = (md: string) =>
  md
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
      const inline = block.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
      return `<p>${inline}</p>`;
    })
    .join("\n");

export const faqHandlers = [
  // legacy board/faq_list.php — 자주묻는질문 목록(idx desc, 30/page).
  http.get(api("/admin/board/faqs"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = [...FAQ_LIST];
    const itemCd = q("search_item_cd");
    if (itemCd && itemCd !== "all") {
      rows = rows.filter((r) => r.faq_type === itemCd); // faq_type = 'val'
    }
    const subject = q("search_subject");
    if (subject) {
      rows = rows.filter((r) => r.question.includes(subject)); // question LIKE '%val%'
    }

    rows.sort((a, b) => b.idx - a.idx); // idx desc

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_FAQ));
    const start = (page - 1) * PER_PAGE_FAQ;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_FAQ).map((r) => ({
        idx: r.idx,
        faq_type: r.faq_type,
        question: r.question,
        answer_html: mdToHtml(r.answer),
      })),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_FAQ,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy faq_register.php(modify 로드) — 상세(answer 원문 마크다운).
  http.get(api("/admin/board/faqs/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = FAQ_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      faq_type: row.faq_type,
      question: row.question,
      answer: row.answer,
    });
  }),

  // legacy faq_ps.php mode=modify — 수정.
  http.put(api("/admin/board/faqs/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as Partial<FaqSaveBody>;
    const row = FAQ_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.faq_type = body.faq_type ?? row.faq_type;
    row.question = body.question ?? row.question;
    row.answer = body.answer ?? row.answer;
    return HttpResponse.json({ success: true });
  }),
];
