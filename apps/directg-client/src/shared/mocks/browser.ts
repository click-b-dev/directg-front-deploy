import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

/**
 * 브라우저(클라이언트) 요청 가로채기용 MSW worker.
 * 로그인/회원가입 등 client-side POST를 mock으로 처리한다(백엔드 부재 구간, dev 전용).
 * 백엔드 연결 시 이 파일과 `shared/mocks/`, `public/mockServiceWorker.js`를 제거한다.
 */
export const worker = setupWorker(...handlers);
