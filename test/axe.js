import axe from "axe-core";

// jsdom has no real layout engine, so rules that depend on computed visual
// rendering (contrast, landmark regions across a full page) are unreliable
// against an isolated component fragment and are disabled here.
const JSDOM_RULES = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

export async function getA11yViolations(node) {
  const results = await axe.run(node, { rules: JSDOM_RULES });
  return results.violations;
}
