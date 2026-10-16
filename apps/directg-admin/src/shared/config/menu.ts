export type AppMenuItem = {
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
    href: "/",
    description: "프로젝트 시작 화면",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    description: "운영 설정 화면",
    requiredRoles: ["ADMIN"],
  },
  {
    key: "demo",
    label: "Demo",
    href: "/demo",
    description: "템플릿 기본 데모 화면",
  },
  {
    key: "login",
    label: "Login",
    href: "/login",
    description: "인증 흐름 점검용 진입점",
  },
];
