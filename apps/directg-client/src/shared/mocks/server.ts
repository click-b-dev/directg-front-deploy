import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/** Next SSR(Node) 요청 가로채기용 MSW 서버. instrumentation.register에서 listen. */
export const server = setupServer(...handlers);
