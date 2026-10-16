// legacy _inc.php pn_json_box — 원본 JSON 응답 접이식 박스(details/summary).
export const PnJsonBox = ({
  data,
  title = "원본 응답 (JSON)",
}: {
  data: unknown;
  title?: string;
}) => (
  <div className="card mb-3">
    <div className="card-body py-2">
      <details>
        <summary className="text-muted" style={{ cursor: "pointer", fontSize: "12px" }}>
          <i className="mdi mdi-code-tags" /> {title}
        </summary>
        <pre
          className="bg-light p-2 mt-2 mb-0"
          style={{ maxHeight: "480px", overflow: "auto", fontSize: "11px" }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  </div>
);
