const surfaceStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  backgroundColor: "#ffffff",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
};

const mutedTextStyle = {
  color: "#64748b",
  fontSize: 14,
};

const statCardStyle = {
  ...surfaceStyle,
  padding: 20,
};

const demoModules = [
  {
    title: "Auth + Guard",
    description: "인증 상태, 라우트 가드, 로그인 리디렉션 흐름을 점검합니다.",
  },
  {
    title: "API + Runtime",
    description: "API client와 환경 변수 구성이 정상인지 검증합니다.",
  },
  {
    title: "FSD + Scaffold",
    description: "next 템플릿 위에서 엔티티/피처 생성이 자연스럽게 이어지도록 구성됩니다.",
  },
];

export const DemoScreen = () => {
  return (
    <section id="demo" style={{ ...surfaceStyle, padding: 24 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Template Demo</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0, marginBottom: 0 }}>
            생성 직후 바로 확인할 수 있는 템플릿 데모 구역입니다. 실제 컴포넌트와 위젯을 이 영역부터
            치환하면 됩니다.
          </p>
        </div>
        <span
          style={{
            borderRadius: 999,
            backgroundColor: "#ecfeff",
            color: "#155e75",
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          next demo
        </span>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {demoModules.map((item) => (
          <article key={item.title} style={{ ...statCardStyle, minHeight: 180 }}>
            <strong style={{ display: "block", fontSize: 18, marginBottom: 10 }}>
              {item.title}
            </strong>
            <p style={{ ...mutedTextStyle, margin: 0, lineHeight: 1.7 }}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
