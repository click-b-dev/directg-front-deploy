export const renderErrorBoundaryModule = () => ({
  creates: [
    {
      relativePath: "src/app/error-boundary.tsx",
      content: `import type { PropsWithChildren } from "react";

type AppErrorBoundaryProps = PropsWithChildren;

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  return <>{children}</>;
};
`,
    },
  ],
});
