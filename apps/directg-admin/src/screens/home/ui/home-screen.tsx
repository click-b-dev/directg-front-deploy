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

const summaryCards = [
  {
    label: "Template",
    value: "tanstack",
    hint: "현재 생성된 템플릿 기반",
  },
  {
    label: "Preset",
    value: "admin",
    hint: "프로젝트 운영 성격",
  },
  {
    label: "Phase",
    value: "Kickoff",
    hint: "착수 직후 기본 뼈대",
  },
];

const deliveryChecklist = [
  "API endpoint 및 인증 방식 확정",
  "공통 레이아웃/권한 정책 리뷰",
  "실제 엔티티/피처 스캐폴딩 시작",
];

export const HomeScreen = () => {
  return (
    <section id="overview" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          ...surfaceStyle,
          padding: 28,
          background:
            "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 52%, rgba(51,65,85,1) 100%)",
          color: "#ffffff",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            width: "fit-content",
            borderRadius: 999,
            padding: "6px 10px",
            backgroundColor: "rgba(255,255,255,0.12)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          tanstack starter
        </span>
        <h1 style={{ marginTop: 18, marginBottom: 12, fontSize: 36, lineHeight: 1.1 }}>
          directg-admin
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          생성 직후 바로 SI 프로젝트를 설명하고 운영 기준을 공유할 수 있도록 기본 화면 뼈대를
          제공합니다. 이 화면 위에 실제 도메인 위젯과 피처를 붙이면 됩니다.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {summaryCards.map((card) => (
          <article key={card.label} style={statCardStyle}>
            <span style={{ ...mutedTextStyle, display: "block", marginBottom: 10 }}>
              {card.label}
            </span>
            <strong style={{ display: "block", fontSize: 28, marginBottom: 6 }}>
              {card.value}
            </strong>
            <span style={{ ...mutedTextStyle, fontSize: 13 }}>{card.hint}</span>
          </article>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 1fr)",
          gap: 16,
        }}
      >
        <section style={{ ...surfaceStyle, padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Delivery Overview</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0 }}>
            프로젝트 초반에 가장 먼저 정리해야 하는 항목들을 기본 섹션으로 배치했습니다.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {deliveryChecklist.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  alignItems: "start",
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#f8fafc",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <strong style={{ display: "block", marginBottom: 6 }}>{item}</strong>
                  <span style={mutedTextStyle}>
                    실제 요구사항에 맞춰 엔티티/피처/위젯 단위로 구체화하십시오.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ ...surfaceStyle, padding: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Starter Notes</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8 }}>
            <li>
              FSD screen layer는 <code>screens</code> 기준입니다.
            </li>
            <li>공통 모듈은 preset에 따라 자동 포함됩니다.</li>
            <li>이 화면은 실제 디자인 전 임시 운영 뼈대입니다.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
};
