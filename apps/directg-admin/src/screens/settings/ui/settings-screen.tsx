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

const settingGroups = [
  {
    title: "Runtime",
    description: "환경 변수, API base URL, 인증 리프레시 주기를 검토합니다.",
  },
  {
    title: "Governance",
    description: "라우팅 규칙, 권한 정책, 코드 생성 기준을 확정합니다.",
  },
  {
    title: "Release",
    description: "tanstack 템플릿 기준 배포/운영 체크리스트를 연결합니다.",
  },
];

export const SettingsScreen = () => {
  return (
    <section id="settings" style={{ ...surfaceStyle, padding: 24 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>Settings Skeleton</h2>
          <p style={{ ...mutedTextStyle, marginTop: 0, marginBottom: 0 }}>
            운영 설정, 권한, 환경 변수 정책을 실제 프로젝트 기준으로 구체화하는 자리입니다.
          </p>
        </div>
        <span
          style={{
            borderRadius: 999,
            backgroundColor: "#eef2ff",
            color: "#3730a3",
            padding: "6px 10px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          scaffold managed
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
        {settingGroups.map((group) => (
          <article key={group.title} style={{ ...statCardStyle, minHeight: 160 }}>
            <strong style={{ display: "block", fontSize: 18, marginBottom: 10 }}>
              {group.title}
            </strong>
            <p style={{ ...mutedTextStyle, margin: 0, lineHeight: 1.7 }}>{group.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
