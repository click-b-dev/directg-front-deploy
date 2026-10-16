/**
 * Next 서버 부팅 훅. Node 런타임에서 MSW 서버를 기동해
 * SSR 데이터 fetch를 mock으로 가로챈다(백엔드 부재 구간).
 * 백엔드 연결 시 이 파일과 shared/mocks/를 제거한다.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { server } = await import("@shared/mocks/server");
    server.listen({ onUnhandledRequest: "bypass" });
  }
}
