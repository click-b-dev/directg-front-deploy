// legacy date('Y-m-d H:i:s', unixts) 재현(KST 브라우저 전제 — 운영 환경 한국).
// epoch 초 → "YYYY-MM-DD HH:MM:SS". epoch 0 → "1970-01-01 09:00:00"(KST), legacy와 동일.
export const formatDateTime = (unixSeconds: number): string => {
  const date = new Date(unixSeconds * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
