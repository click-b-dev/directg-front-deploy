export const renderMenuModule = ({ moduleNames = [] } = {}) => {
  const withPermission = moduleNames.includes("permission") && moduleNames.includes("auth");
  const homeHref = "/";
  const demoHref = "/demo";
  const settingsHref = "/settings";
  const loginHref = "/login";
  const withAuth = moduleNames.includes("auth");
  const permissionImports = withPermission
    ? `import { useAuthSession } from "@shared/lib/auth/provider";
import { filterByPermission } from "@shared/lib/permission";`
    : "";
  const permissionSetup = withPermission
    ? `  const { session } = useAuthSession();
  const visibleMenuItems = filterByPermission(menuItems, session?.user?.role ?? null);
`
    : "  const visibleMenuItems = menuItems.filter((item) => !item.requiredRoles?.length);\n";

  return {
    creates: [
      {
        relativePath: "src/shared/config/menu.ts",
        content: `export type AppMenuItem = {
  key: string;
  label: string;
  href: string;
  description?: string;
  requiredRoles?: string[];
};

export const menuItems: AppMenuItem[] = [
  {
    key: "home",
    label: "Home",
    href: "${homeHref}",
    description: "프로젝트 시작 화면",
  },
  {
    key: "settings",
    label: "Settings",
    href: "${settingsHref}",
    description: "운영 설정 화면",
    requiredRoles: ["ADMIN"],
  },
  {
    key: "demo",
    label: "Demo",
    href: "${demoHref}",
    description: "템플릿 기본 데모 화면",
  },${
    withAuth
      ? `
  {
    key: "login",
    label: "Login",
    href: "${loginHref}",
    description: "인증 흐름 점검용 진입점",
  },`
      : ""
  }
];
`,
      },
      {
        relativePath: "src/widgets/app-navigation/ui/app-navigation.tsx",
        content: `import { menuItems } from "@shared/config/menu";
${permissionImports ? `${permissionImports}\n` : ""}
export const AppNavigation = () => {
${permissionSetup}  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;

  return (
    <nav aria-label="App navigation">
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(\`\${item.href}/\`);

          return (
            <li key={item.key}>
              <a
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: isActive ? "#ffffff" : "#0f172a",
                  backgroundColor: isActive ? "#0f172a" : "#f8fafc",
                  boxShadow: isActive ? "0 8px 20px rgba(15, 23, 42, 0.18)" : "none",
                }}
              >
                <strong style={{ display: "block", fontSize: 14 }}>{item.label}</strong>
                {item.description ? (
                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: isActive ? "rgba(255,255,255,0.8)" : "#64748b",
                      fontSize: 12,
                    }}
                  >
                    {item.description}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
`,
      },
      {
        relativePath: "src/widgets/app-navigation/index.ts",
        content: `export { AppNavigation } from "./ui/app-navigation";
`,
      },
    ],
  };
};
