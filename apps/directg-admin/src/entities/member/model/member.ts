// legacy member_list.php $member_level_arr / $member_type_arr. 미매핑은 빈 문자열(PHP undefined index).
export const MEMBER_LEVEL_LABEL: Record<number, string> = {
  1: "일반",
  2: "정회원",
  3: "VIP",
};

export const MEMBER_TYPE_LABEL: Record<string, string> = {
  P: "일반",
  R: "리셀러",
  S: "휴면",
  E: "이벤트",
};

// legacy member_view.php $sns_type_arr — strtolower(sns_type) 키. 미매핑은 빈 문자열.
export const SNS_TYPE_BADGE: Record<string, { label: string; variant: string }> = {
  "": { label: "이메일", variant: "bg-primary" },
  naver: { label: "네이버", variant: "bg-success" },
  kakao: { label: "카카오", variant: "bg-warning" },
  payco: { label: "페이코", variant: "bg-danger" },
};

// legacy member_naver_list.php $search_flag_arr — 간편로그인 연결구분(표 셀). 미매핑은 빈 문자열.
export const SNS_FLAG_LABEL: Record<string, string> = {
  N: "신규 가입",
  C: "계정 연결",
};

// legacy directsend_mail_log.php $gubun_arr — 발송구분. 미매핑은 빈 문자열.
export const MAIL_GUBUN_LABEL: Record<string, string> = {
  join: "가입인증",
  password: "비밀번호찾기",
  qna: "문의답변",
};

// legacy directsend_mail_log.php $state_arr — 발송 상태(1~8). 미매핑은 빈 문자열.
export const MAIL_STATE_LABEL: Record<number, string> = {
  1: "발송대기",
  2: "성공",
  3: "일시적",
  4: "도메인에러",
  5: "서버연결",
  6: "메일박스",
  7: "기타",
  8: "수신거부",
};

// legacy member_view.php $gubun_array — 문의 구분. 미매핑은 빈 문자열.
export const QNA_GUBUN_LABEL: Record<string, string> = {
  "1": "게임 설치, 플레이",
  "2": "주문, 결제",
  "5": "제품 코드(키) 오류",
  "7": "한글, 제공 콘텐츠",
  "6": "계정, 회원, 인증",
  "4": "취소, 환불",
  "8": "할인, 가격",
  "9": "이용방법",
  "3": "기타",
};

// legacy AdminV1::getMemberAge — YYMMDD(6)면 date('y')>yy로 세기 판별, 그 외 앞 4자리.
// 월/일 보정은 legacy에서 주석처리 → 연도 차이만(만나이 아님, quirk 유지).
export const getMemberAge = (birthDay: string): number => {
  const currentYear = new Date().getFullYear();
  let birthYear: number;
  if (birthDay.length === 6) {
    const yy = Number(birthDay.slice(0, 2));
    birthYear = currentYear % 100 > yy ? 2000 + yy : 1900 + yy;
  } else {
    birthYear = Number(birthDay.slice(0, 4));
  }
  return currentYear - birthYear;
};
