/**
 * 회원 세션 — legacy `$_SESSION['member']` 필드.
 * 백엔드 계약: httpOnly 세션 쿠키 기반. `GET /api/member/session`(후속 단위)이 반환.
 * 문서: docs/migration/storefront/member/login.md
 */
export interface MemberSession {
  m_no: number;
  m_id: string;
  name: string;
  hp: string;
  nickname: string;
  mem_level: string;
  visitorId: string;
  mem_type: string;
}

/** 이메일/비번 로그인 요청. legacy 필드명 `h-captcha-response` → `hCaptchaToken`으로 정규화. */
export interface MemberLoginRequest {
  m_id: string;
  m_pwd: string;
  return_url?: string;
  hCaptchaToken: string;
}

/** 로그인 응답 — legacy `login_proc.php` JSON 형식 유지. `error_code` "0"=성공, "1"=실패. */
export interface MemberLoginResponse {
  error_code: string;
  error_msg: string;
}

/** 아이디 중복확인 응답 — legacy join_proc `mode=idChk`. `error_code` "0"=가능, "1"=불가. */
export interface MemberCheckIdResponse {
  error_code: string;
  msg: string;
}

/** 회원가입 요청 — legacy join_proc `mode=join`. 본인인증 비활성으로 name/birthday 없음. */
export interface MemberJoinRequest {
  m_id: string;
  m_pwd: string;
  m_pwd_re: string;
  is_mailling?: string;
  is_event?: string;
  visitorId?: string;
  hCaptchaToken: string;
}

/** 회원가입 응답 — `error_code` "0"=성공, "1"=실패, "2"=해외차단, "3"=IP차단. */
export interface MemberJoinResponse {
  error_code: string;
  msg: string;
}

/** 비밀번호 찾기 요청 — legacy join_proc `mode=findpassword`. */
export interface MemberFindPasswordRequest {
  email: string;
}

/**
 * 비밀번호 찾기 응답 — legacy JSON 형식 유지.
 * 성공 시 `m_id`/`token`을 `user_certification.html` POST로 넘긴다. `otp`는 legacy 응답에 포함되지만 화면에서 사용하지 않는다.
 */
export interface MemberFindPasswordResponse {
  error_code: string;
  msg: string;
  m_id?: string;
  token?: string;
  otp?: string;
}

/**
 * OTP 인증 상태 — 비밀번호 재설정 페이지 진입 가드용(legacy `Mypage::getOtp` 축소).
 * legacy는 `$data['auth']=='0'` 이면 "비정상적인 접근". auth: '0'=미인증 / '1'=인증완료.
 * otp/token 원문은 노출하지 않는다(가드는 auth만 필요). row 미존재는 `exists:false`.
 */
export interface MemberOtpStatusResponse {
  auth: string;
  exists: boolean;
}

/** 비밀번호 재설정 요청 — legacy join_proc `mode=resetpassword`. token/auth_code는 미전송(legacy 그대로). */
export interface MemberResetPasswordRequest {
  m_id: string;
  m_pwd: string;
  m_pwd_re: string;
}

/** 비밀번호 재설정 응답 — legacy JSON 형식 유지. `error_code` "0"=성공, "1"=불일치. */
export interface MemberResetPasswordResponse {
  error_code: string;
  msg: string;
}

/** 인증번호 확인 요청 — legacy join_proc `mode=authConfirm`. legacy는 선행 m_id를 email 필드로 전송. */
export interface MemberAuthConfirmRequest {
  email: string;
  token: string;
  auth_code: string;
}

/**
 * 인증번호 확인 응답 — legacy JSON 형식 유지. `error_code` "0"=성공, "1"=실패.
 * 성공 시 `auth_code`/`token`을 find_password_reset로 전달. 실패 msg는 끝에 token이 붙는다(legacy quirk).
 */
export interface MemberAuthConfirmResponse {
  error_code: string;
  msg: string;
  auth_code?: string;
  token?: string;
}

/**
 * 회원 존재 확인 응답 — 모바일 비번찾기 가드(legacy `Member::isMemberChk2`, status='0' 활성 회원).
 * "OK"→true / "NO MEMBER"→false.
 */
export interface MemberExistsResponse {
  exists: boolean;
}

/** OTP 발송 요청 — legacy 모바일 `directsend_mail_api.php mode=authEmail`. gubun="password". */
export interface MemberOtpSendRequest {
  m_id: string;
  gubun: string;
}

/** OTP 검증 요청 — legacy 모바일 `user_certification_proc.php mode=authConfirm`. */
export interface MemberOtpVerifyRequest {
  m_id: string;
  token: string;
  auth_code: string;
}

/** OTP 검증 응답 — legacy 형식 유지. code "ok"=성공(재설정 이동) / "error"=실패(message alert). */
export interface MemberOtpVerifyResponse {
  code: string;
  message: string;
}

/** 비밀번호 재설정 요청(모바일) — legacy `find_password_reset_proc.php memberPwdReset`. 필드 new_pwd. */
export interface MemberPasswordResetRequest {
  m_id: string;
  token: string;
  new_pwd: string;
  new_pwd_re: string;
}

/** 비밀번호 재설정 응답(모바일) — legacy 형식 유지. code "ok"=성공(complete 이동) / 그 외 message alert. */
export interface MemberPasswordResetResponse {
  code: string;
  message: string;
}

/** OTP 발송 응답 — legacy 형식 유지. msg=발송 안내, token=생성/갱신된 OTP 토큰(confirm으로 전달). */
export interface MemberOtpSendResponse {
  msg: string;
  token: string;
}

/** 이메일 인증 랜딩 요청 — legacy join_confirm.php GET 파라미터. */
export interface MemberJoinConfirmRequest {
  m_no: string;
  auth_key: string;
  m_id: string;
}

/** 이메일 인증 랜딩 응답 — `error_code` "0"=승인 성공(로그인 이동), "1"=실패. */
export interface MemberJoinConfirmResponse {
  error_code: string;
  msg: string;
}

/** SNS 간편로그인 공급자. */
export type SnsProvider = "naver" | "kakao" | "payco";

/** SNS OAuth 인가 URL 응답. */
export interface SnsLoginUrlResponse {
  url: string;
}
