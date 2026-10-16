import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type SurveyQuestion = {
  number: number;
  question: string;
  type: "radio" | "checkbox" | "descript";
  required: string;
  etc: number;
  items: string[];
};
type SurveyRow = {
  idx: number;
  banner_image: string;
  subject: string;
  reg_dt: string;
  start_dt: string;
  end_dt: string;
  max_people: number;
  cnt: number;
  flag: string;
  view_result: string;
  point: number;
  questions: SurveyQuestion[];
};

type SurveySaveBody = {
  subject: string;
  start_dt: string;
  end_dt: string;
  max_people: string; // "0"(무제한) | ""(최대)
  max_people_val: number;
  view_result: string;
  point: number;
  flag: string;
  banner_image: string;
  delete_current_image: string;
  questions: SurveyQuestion[];
};

// legacy directgames.tbl_survey(+question/item) 재현(등록/수정 반영 위해 mutable).
const SURVEY_LIST: SurveyRow[] = [
  {
    idx: 31,
    banner_image: "/upload/survey/summer2026.jpg",
    subject: "2026 여름 이용자 만족도 조사",
    reg_dt: "2026-07-01 10:00:00",
    start_dt: "2026-07-05 00:00:00",
    end_dt: "2026-08-31 23:59:59",
    max_people: 0,
    cnt: 1284,
    flag: "Y",
    view_result: "N",
    point: 100,
    questions: [
      {
        number: 0,
        question: "서비스 전반에 만족하십니까?",
        type: "radio",
        required: "Y",
        etc: 0,
        items: ["매우 만족", "만족", "보통", "불만족"],
      },
      {
        number: 1,
        question: "개선점을 자유롭게 적어주세요.",
        type: "descript",
        required: "N",
        etc: 0,
        items: [],
      },
    ],
  },
  {
    idx: 28,
    banner_image: "",
    subject: "신규 결제수단 도입 관련 설문",
    reg_dt: "2026-06-10 14:20:00",
    start_dt: "2026-06-12 00:00:00",
    end_dt: "2026-06-30 23:59:59",
    max_people: 500,
    cnt: 500,
    flag: "N",
    view_result: "N",
    point: 0,
    questions: [
      {
        number: 0,
        question: "선호하는 결제수단은?",
        type: "checkbox",
        required: "Y",
        etc: 0,
        items: ["카드", "계좌이체", "간편결제", "휴대폰"],
      },
    ],
  },
  {
    idx: 22,
    banner_image: "/upload/survey/newyear.jpg",
    subject: "한글패치 우선순위 투표",
    reg_dt: "2026-01-02 09:00:00",
    start_dt: "2026-01-05 00:00:00",
    end_dt: "2026-02-05 23:59:59",
    max_people: 1000,
    cnt: 873,
    flag: "N",
    view_result: "N",
    point: 50,
    questions: [
      {
        number: 0,
        question: "가장 원하는 한글패치 게임은?",
        type: "radio",
        required: "Y",
        etc: 0,
        items: ["게임 A", "게임 B", "게임 C"],
      },
    ],
  },
  {
    idx: 15,
    banner_image: "",
    subject: "[작성중] 가을 이벤트 사전 설문 (참여자 없음)",
    reg_dt: "2026-09-01 09:00:00",
    start_dt: "2026-09-10 00:00:00",
    end_dt: "2026-09-30 23:59:59",
    max_people: 0,
    cnt: 0,
    flag: "Y",
    view_result: "N",
    point: 0,
    questions: [
      {
        number: 0,
        question: "가을 이벤트 참여 의향이 있나요?",
        type: "radio",
        required: "Y",
        etc: 0,
        items: ["예", "아니오"],
      },
    ],
  },
];

const PER_PAGE_SURVEY = 20;

const nowString = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const toListItem = (r: SurveyRow) => ({
  idx: r.idx,
  banner_image: r.banner_image,
  subject: r.subject,
  reg_dt: r.reg_dt,
  start_dt: r.start_dt,
  end_dt: r.end_dt,
  max_people: r.max_people,
  cnt: r.cnt,
  flag: r.flag,
});

// 무제한("0")→0 / 최대("")→max_people_val (legacy 계산)
const resolveMaxPeople = (radio: string, val: number) => (radio === "0" ? 0 : val);

export const surveyHandlers = [
  // legacy board/survey_list.php — 설문조사 목록(ts.idx DESC, 20/page).
  http.get(api("/admin/board/surveys"), ({ request }) => {
    const url = new URL(request.url);
    const q = (key: string) => url.searchParams.get(key) ?? "";
    const page = Math.max(1, Number.parseInt(q("page") || "1", 10) || 1);

    let rows = [...SURVEY_LIST];
    const searchValue = q("search_value");
    if (searchValue) {
      rows = rows.filter((r) => r.subject.includes(searchValue)); // subject LIKE
    }

    rows.sort((a, b) => b.idx - a.idx); // ts.idx DESC

    const totalResults = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE_SURVEY));
    const start = (page - 1) * PER_PAGE_SURVEY;
    return HttpResponse.json({
      items: rows.slice(start, start + PER_PAGE_SURVEY).map(toListItem),
      pagination: {
        current_page: page,
        results_per_page: PER_PAGE_SURVEY,
        total_results: totalResults,
        total_pages: totalPages,
      },
    });
  }),

  // legacy survey_register.php(modify 로드) — 상세(마스터 + 문항).
  http.get(api("/admin/board/surveys/:idx"), ({ params }) => {
    const idx = Number(params.idx);
    const row = SURVEY_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    return HttpResponse.json({
      idx: row.idx,
      subject: row.subject,
      start_dt: row.start_dt,
      end_dt: row.end_dt,
      max_people: row.max_people,
      view_result: row.view_result,
      point: row.point,
      flag: row.flag,
      banner_image: row.banner_image,
      reg_dt: row.reg_dt,
      survey_count: row.cnt,
      questions: row.questions,
    });
  }),

  // legacy survey_result.php — 결과보기(요약 + 문항별 집계, 응답수는 mock 합성).
  http.get(api("/admin/board/surveys/:idx/result"), ({ params }) => {
    const idx = Number(params.idx);
    const row = SURVEY_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    const questions = row.questions.map((q, qi) => {
      const buckets = q.items.length + (q.etc ? 1 : 0);
      const share = buckets > 0 ? Math.floor(row.cnt / buckets) : 0;
      return {
        idx: row.idx * 100 + qi, // 합성 문항 DB id
        number: q.number,
        question: q.question,
        type: q.type,
        etc: q.etc,
        items:
          q.type === "descript"
            ? []
            : q.items.map((item, ii) => ({ number: ii + 1, item, cnt: share })),
        etc_cnt: q.etc ? row.cnt - share * q.items.length : 0,
      };
    });
    return HttpResponse.json({
      idx: row.idx,
      subject: row.subject,
      start_dt: row.start_dt,
      end_dt: row.end_dt,
      max_people: row.max_people,
      point: row.point,
      survey_count: row.cnt,
      questions,
    });
  }),

  // legacy survey_result_etc.php — 문항별 기타/주관식 답변(qidx=survey_idx*100+qi 합성).
  http.get(api("/admin/board/survey-etc-answers/:qidx"), ({ params, request }) => {
    const qidx = Number(params.qidx);
    const url = new URL(request.url);
    const all = url.searchParams.get("all") === "1";
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);

    const surveyIdx = Math.floor(qidx / 100);
    const qi = qidx % 100;
    const row = SURVEY_LIST.find((r) => r.idx === surveyIdx);
    const question = row?.questions[qi];
    // descript → answer null(주관식) / else → answer 100(기타)
    const answerVal = question && question.type !== "descript" ? 100 : null;
    // 합성 답변(문항별 소량)
    const SAMPLE = [
      { answer_text: "전반적으로 만족합니다.", m_id: "gamer01" },
      { answer_text: "가격이 조금 비싸요.", m_id: "buyer_kim" },
      { answer_text: "한글패치 더 많이 부탁드립니다.", m_id: "hangeul" },
    ];
    const rows = question ? SAMPLE.map((s) => ({ ...s, answer: answerVal })) : [];

    const totalResults = rows.length;
    const items = all ? rows : rows.slice((page - 1) * 50, (page - 1) * 50 + 50);
    return HttpResponse.json({
      question: question?.question ?? "",
      total_results: totalResults,
      // getAnswerCount(qidx,100): 기타면 총계, 주관식이면 0(프론트 fallback)
      answer_all_count: answerVal === 100 ? totalResults : 0,
      items,
      pagination: {
        current_page: page,
        results_per_page: 50,
        total_results: totalResults,
        total_pages: Math.max(1, Math.ceil(totalResults / 50)),
      },
    });
  }),

  // legacy survey_result_user.php — 사용자별 결과 매트릭스.
  http.get(api("/admin/board/surveys/:idx/user-results"), ({ params, request }) => {
    const idx = Number(params.idx);
    const url = new URL(request.url);
    const searchValue = url.searchParams.get("search_value") ?? "";
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const row = SURVEY_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }

    // 문항 → 컬럼(etc면 '기타' 컬럼 추가)
    const columns: { id: string; label: string; tooltip: string }[] = [];
    row.questions.forEach((q, qi) => {
      columns.push({ id: `q${qi}`, label: `${q.number + 1}번 문항`, tooltip: q.question });
      if (q.etc) {
        columns.push({
          id: `q${qi}_etc`,
          label: `${q.number + 1}번 문항 '기타'`,
          tooltip: q.question,
        });
      }
    });

    // 합성 사용자 답변
    const MOCK_USERS = ["gamer01", "buyer_kim", "hangeul"];
    let users = MOCK_USERS;
    if (searchValue) {
      users = users.filter((m) => m === searchValue); // m_id 정확일치
    }
    const rows = users.map((m_id, ui) => {
      const values: string[] = [];
      row.questions.forEach((q) => {
        if (q.type === "descript") {
          values.push(`${m_id}의 주관식 답변 예시`);
        } else {
          values.push(String(((ui + 1) % Math.max(1, q.items.length)) + 1)); // 선택 번호
        }
        if (q.etc) {
          values.push(`${m_id}의 기타 의견`);
        }
      });
      return { m_id, values };
    });

    const totalResults = rows.length;
    return HttpResponse.json({
      subject: row.subject,
      start_dt: row.start_dt,
      end_dt: row.end_dt,
      max_people: row.max_people,
      point: row.point,
      survey_count: row.cnt,
      columns,
      rows: rows.slice((page - 1) * 50, (page - 1) * 50 + 50),
      pagination: {
        current_page: page,
        results_per_page: 50,
        total_results: totalResults,
        total_pages: Math.max(1, Math.ceil(totalResults / 50)),
      },
    });
  }),

  // legacy survey_ps.php mode=register — 등록.
  http.post(api("/admin/board/surveys"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Partial<SurveySaveBody>;
    const nextIdx = SURVEY_LIST.reduce((max, r) => Math.max(max, r.idx), 0) + 1;
    SURVEY_LIST.push({
      idx: nextIdx,
      banner_image: body.banner_image ? `/upload/banner/survey/${body.banner_image}` : "",
      subject: body.subject ?? "",
      reg_dt: nowString(),
      start_dt: body.start_dt ?? "",
      end_dt: body.end_dt ?? "",
      max_people: resolveMaxPeople(body.max_people ?? "0", body.max_people_val ?? 0),
      cnt: 0,
      flag: body.flag ?? "Y",
      view_result: body.view_result ?? "N",
      point: body.point ?? 0,
      questions: body.questions ?? [],
    });
    return HttpResponse.json({ success: true });
  }),

  // legacy survey_ps.php mode=update — 수정(참여자>0이면 마스터 subject/start/end/flag만).
  http.put(api("/admin/board/surveys/:idx"), async ({ params, request }) => {
    const idx = Number(params.idx);
    const body = (await request.json().catch(() => ({}))) as Partial<SurveySaveBody>;
    const row = SURVEY_LIST.find((r) => r.idx === idx);
    if (!row) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    row.subject = body.subject ?? row.subject;
    row.start_dt = body.start_dt ?? row.start_dt;
    row.end_dt = body.end_dt ?? row.end_dt;
    row.flag = body.flag ?? row.flag;
    if (body.delete_current_image === "Y") {
      row.banner_image = "";
    }
    if (body.banner_image) {
      row.banner_image = `/upload/banner/survey/${body.banner_image}`;
    }
    // 참여자 없을 때만 문항 재설정(legacy: delete + reinsert).
    if (row.cnt === 0 && body.questions) {
      row.questions = body.questions;
    }
    return HttpResponse.json({ success: true });
  }),
];
