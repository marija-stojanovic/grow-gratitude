export const GRATITUDE_MAX_LENGTH = 300;
export const PLANT_NAME_MAX_LENGTH = 50;
export const CHALLENGE_TITLE_MAX_LENGTH = 100;

export type TextValidationResult =
  | { valid: true; value: string }
  | { valid: false; reason: 'required' | 'too-long' };

function validateRequiredText(value: string, maxLength: number): TextValidationResult {
  const normalized = value.trim();
  if (!normalized) return { valid: false, reason: 'required' };
  if (normalized.length > maxLength) return { valid: false, reason: 'too-long' };
  return { valid: true, value: normalized };
}

export const validateGratitude = (value: string) =>
  validateRequiredText(value, GRATITUDE_MAX_LENGTH);
export const validatePlantName = (value: string) =>
  validateRequiredText(value, PLANT_NAME_MAX_LENGTH);
export const validateChallengeTitle = (value: string) =>
  validateRequiredText(value, CHALLENGE_TITLE_MAX_LENGTH);
