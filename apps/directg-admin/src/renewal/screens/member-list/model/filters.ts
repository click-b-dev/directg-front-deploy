import type { MemberListSearch } from "@entities/member";
import type { MemberListQuery } from "@/renewal/entities/member-list";
import { DEFAULT_PAGE_SIZE } from "@/renewal/shared/lib/pagination";

export type DateType = "reg" | "log";

// Figma AD-Member-List-01 조회 조건 폼 값. API 파라미터(MemberListSearch)와 별도로 폼 상태를 둔다.
export type FilterForm = {
  searchType: string;
  searchValue: string;
  level: string;
  dateType: DateType;
  startDate: string;
  endDate: string;
  isAuth: string;
  oldLogin: string;
};

// 검색어가 있는데 검색 대상을 고르지 않은 경우의 기본 대상.
export const DEFAULT_SEARCH_TYPE = "name";

export const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "회원 이름" },
  { value: "nickname", label: "닉네임" },
  { value: "hp", label: "휴대폰 번호" },
];

export const DATE_TYPE_OPTIONS: Array<{ value: DateType; label: string }> = [
  { value: "reg", label: "가입일" },
  { value: "log", label: "최근 접속일" },
];

export const IS_AUTH_OPTIONS = [
  { value: "Y", label: "인증완료" },
  { value: "N", label: "미인증" },
];

export const OLD_LOGIN_OPTIONS = [
  { value: "30", label: "30일 이상 미접속" },
  { value: "90", label: "90일 이상 미접속" },
  { value: "180", label: "180일 이상 미접속" },
  { value: "365", label: "1년 이상 미접속" },
];

export const formatDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

// 기획: 시작일 기본값=이번달 1일, 종료일 기본값=오늘.
export const getDefaultPeriod = (now = new Date()) => ({
  startDate: formatDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  endDate: formatDate(now),
});

// 기획: 오늘 / 최근 7일 / 최근 14일 — 종료일은 오늘, 시작일은 오늘을 포함해 N일 전(예: 7일 = 오늘-6).
export const getQuickPeriod = (days: number, now = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  return { startDate: formatDate(start), endDate: formatDate(now) };
};

export const QUICK_PERIODS = [
  { label: "오늘", days: 1 },
  { label: "최근 7일", days: 7 },
  { label: "최근 14일", days: 14 },
];

export const fromSearch = (search: MemberListSearch): FilterForm => {
  const hasLog = search.start_log_date !== "" || search.end_log_date !== "";
  const defaults = getDefaultPeriod();
  return {
    searchType: search.search_type,
    searchValue: search.search_value,
    level: search.member_level > 0 ? String(search.member_level) : "",
    dateType: hasLog ? "log" : "reg",
    startDate: (hasLog ? search.start_log_date : search.start_reg_date) || defaults.startDate,
    endDate: (hasLog ? search.end_log_date : search.end_reg_date) || defaults.endDate,
    isAuth: search.is_auth === "Y" || search.is_auth === "N" ? search.is_auth : "",
    oldLogin: search.old_login,
  };
};

export const toSearch = (form: FilterForm): MemberListSearch => ({
  page: 1,
  search_type: form.searchValue.trim() === "" ? "" : form.searchType || DEFAULT_SEARCH_TYPE,
  search_value: form.searchValue.trim(),
  member_level: Number(form.level) || 0,
  old_login: form.oldLogin,
  mailling: "",
  is_auth: form.isAuth,
  mem_type: "",
  start_reg_date: form.dateType === "reg" ? form.startDate : "",
  end_reg_date: form.dateType === "reg" ? form.endDate : "",
  start_log_date: form.dateType === "log" ? form.startDate : "",
  end_log_date: form.dateType === "log" ? form.endDate : "",
  sort: "",
  dir: "",
});

export const EMPTY_SEARCH: MemberListQuery = {
  page: 1,
  per_page: DEFAULT_PAGE_SIZE,
  search_type: "",
  search_value: "",
  member_level: 0,
  old_login: "",
  mailling: "",
  is_auth: "",
  mem_type: "",
  start_reg_date: "",
  end_reg_date: "",
  start_log_date: "",
  end_log_date: "",
  sort: "",
  dir: "",
};
