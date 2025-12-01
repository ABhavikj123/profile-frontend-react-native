export function isEmpty(value?: string | null): boolean {
  return !value || value.trim().length === 0;
}

export function normalize(value?: string | null): string {
  return value ? value.trim() : "";
}

export function validateEmail(value: string): string | null {
  const email = normalize(value);
  if (isEmpty(email)) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email";
  return null;
}

export function validatePassword(value: string, minLength = 6): string | null {
  const password = value || "";
  if (password.length === 0) return "Password is required";
  if (password.length < minLength)
    return `Password must be at least ${minLength} characters`;
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (confirm.length === 0) return "Confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
}

export function validateName(value: string): string | null {
  const name = normalize(value);
  if (isEmpty(name)) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name is too long";
  return null;
}

export function validateBio(value: string): string | null {
  const bio = normalize(value);
  if (bio.length === 0) return null;
  if (bio.length < 10) return "Bio must be at least 10 characters";
  if (bio.length > 300) return "Bio must be less than 300 characters";
  return null;
}

export function validateFields<T extends Record<string, string | null>>(fields: T): T {
  return fields;
}
