export function getProgressPercent(currentStep: number, totalSteps: number) {
  if (totalSteps <= 0) return 0;
  return Math.round((currentStep / totalSteps) * 100);
}
