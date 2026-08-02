import { Test, TestingModule } from '@nestjs/testing';
import { PasswordPolicyService } from './password-policy.service';

describe('PasswordPolicyService', () => {
  let service: PasswordPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordPolicyService],
    }).compile();

    service = module.get(PasswordPolicyService);
  });

  it('accepts a valid password', () => {
    expect(service.validate('secret123').valid).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = service.validate('short');

    expect(result.valid).toBe(false);
    expect(result.message).toContain('mínimo 8');
  });

  it('rejects a password longer than 128 characters', () => {
    expect(service.validate('a'.repeat(129)).valid).toBe(false);
  });

  it('rejects whitespace-only passwords', () => {
    expect(service.validate('       ').valid).toBe(false);
  });

  it('rejects obvious weak passwords', () => {
    expect(service.validate('password').valid).toBe(false);
    expect(service.validate('12345678').valid).toBe(false);
  });

  it('accepts an empty string only as a controlled invalid result', () => {
    expect(service.validate('').valid).toBe(false);
  });
});
