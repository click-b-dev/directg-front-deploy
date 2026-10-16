import { menuItems } from "@shared/config/menu";

export const AppNavigation = () => {
  const visibleMenuItems = menuItems.filter((item) => !item.requiredRoles?.length);
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;

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
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
