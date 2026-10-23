import type { ApiErrorMessages } from "@shared/api/envelope";

// swagger(https://directg-classic-api.clickb.co.kr)에 API별로 명시된 에러 code → 화면 문구.
// 명시되지 않은 code는 shared/api/envelope.ts의 공통 문구로 폴백한다.

// GET /api/admin/assets — 400, 401
export const ASSET_LIST_ERRORS: ApiErrorMessages = {
  BAD_REQUEST: "검색 조건을 확인해 주세요.",
};

// POST /api/admin/assets — 400, 401, 500
export const ASSET_CREATE_ERRORS: ApiErrorMessages = {
  BAD_REQUEST: "입력값을 확인해 주세요. (Asset 명, 유형, 형식, 플랫폼은 필수입니다)",
  INTERNAL_SERVER_ERROR: "Asset 등록 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

// GET /api/codes — 400
export const CODE_LIST_ERRORS: ApiErrorMessages = {
  BAD_REQUEST: "코드 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  FORBIDDEN: "코드 목록을 조회할 권한이 없습니다.",
};

// POST /api/codes — 400, 409
export const CODE_CREATE_ERRORS: ApiErrorMessages = {
  BAD_REQUEST: "코드 그룹과 코드명을 확인해 주세요. (코드명은 64자 이내)",
  CONFLICT: "이미 등록된 코드입니다.",
  FORBIDDEN: "코드를 등록할 권한이 없습니다.",
};

// PUT /api/codes/{codeId} — 400, 403, 404
export const CODE_UPDATE_ERRORS: ApiErrorMessages = {
  BAD_REQUEST: "코드명을 확인해 주세요. (64자 이내)",
  FORBIDDEN: "코드를 수정할 권한이 없습니다.",
  NOT_FOUND: "수정할 코드를 찾을 수 없습니다. 목록을 새로고침해 주세요.",
};

// DELETE /api/codes/{codeId} — 403, 404, 409
export const CODE_DELETE_ERRORS: ApiErrorMessages = {
  FORBIDDEN: "코드를 삭제할 권한이 없습니다.",
  NOT_FOUND: "삭제할 코드를 찾을 수 없습니다. 목록을 새로고침해 주세요.",
  CONFLICT: "삭제할 수 없는 코드입니다. 사용 중인 코드인지 확인해 주세요.",
};
