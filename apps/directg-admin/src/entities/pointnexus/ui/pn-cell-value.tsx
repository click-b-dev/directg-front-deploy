// legacy pointnexus 동적 테이블 셀 렌더 — 값 타입별 분기(array/object → JSON code,
// bool → badge, GUID → monospace, 그 외 → 문자열). legacy 분기 순서를 그대로 따른다.
const GUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-/;

export const PnCellValue = ({ value }: { value: unknown }) => {
  if (value !== null && typeof value === "object") {
    return <code style={{ fontSize: "11px" }}>{JSON.stringify(value)}</code>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={`badge bg-${value ? "success" : "secondary"}`}>
        {value ? "true" : "false"}
      </span>
    );
  }
  const s = value == null ? "" : String(value);
  if (GUID_PREFIX.test(s)) {
    return <span className="text-monospace small">{s}</span>;
  }
  return <>{s}</>;
};
