import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runPostActions = async (plan) => {
  for (const action of plan.postActions) {
    switch (action.type) {
      case "install":
        await execFileAsync("pnpm", ["install"], {
          cwd: action.cwd,
        });
        break;
      default:
        throw new Error(`Unsupported post-action type: ${action.type}`);
    }
  }
};
