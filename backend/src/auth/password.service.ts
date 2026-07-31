import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class PasswordService {
  hash(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
