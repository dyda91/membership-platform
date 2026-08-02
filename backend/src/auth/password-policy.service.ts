import { Injectable } from '@nestjs/common';

export interface PasswordPolicyResult {
  valid: boolean;
  message: string;
}

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  '12345678',
  '123456789',
  'qwerty123',
  'letmein',
  'iloveyou',
  'abc12345',
]);

/**
 * Single shared server-side password policy. The backend is authoritative for
 * registration, password change and password reset. Avoids arbitrary
 * composition rules that encourage predictable passwords.
 */
@Injectable()
export class PasswordPolicyService {
  validate(password: string): PasswordPolicyResult {
    if (typeof password !== 'string' || password.length === 0) {
      return { valid: false, message: 'Informe uma senha.' };
    }

    if (password.trim().length === 0) {
      return {
        valid: false,
        message: 'A senha não pode conter apenas espaços.',
      };
    }

    if (password.length < MIN_LENGTH) {
      return {
        valid: false,
        message: `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`,
      };
    }

    if (password.length > MAX_LENGTH) {
      return {
        valid: false,
        message: `A senha deve ter no máximo ${MAX_LENGTH} caracteres.`,
      };
    }

    if (WEAK_PASSWORDS.has(password.toLowerCase())) {
      return {
        valid: false,
        message: 'Esta senha é muito comum. Escolha outra.',
      };
    }

    return { valid: true, message: '' };
  }
}
