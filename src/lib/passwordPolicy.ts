export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres";
  }

  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula e um número";
  }

  return null;
}
