import { adminPreset } from "./admin.js";
import { dashboardPreset } from "./dashboard.js";
import { landingPreset } from "./landing.js";
import { portalPreset } from "./portal.js";

const PRESETS = {
  admin: adminPreset,
  dashboard: dashboardPreset,
  landing: landingPreset,
  portal: portalPreset,
};

export const getPresetNames = () => Object.keys(PRESETS);

export const getPreset = (presetName) => {
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(
      `지원하지 않는 프리셋: ${presetName}. 지원 프리셋: ${getPresetNames().join(", ")}`,
    );
  }
  return preset;
};
