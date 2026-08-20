export function getAttackState(scenario, elapsed) {
  const progress = elapsed / scenario.duration;

  let phase = "Starting";

  if (progress < 0.20) {
    phase = "Starting";
  } else if (progress < 0.50) {
    phase = "Growing";
  } else if (progress < 0.80) {
    phase = "Peak";
  } else {
    phase = "Recovery";
  }

  return {
    type: scenario.attack,
    severity: scenario.severity,
    phase,
    duration: scenario.duration,
    elapsed,
    progress,
  };
}