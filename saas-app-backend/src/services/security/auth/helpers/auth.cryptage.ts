import * as crypto from 'crypto';

export class AuthCryptageHelper {
  constructor() {}

  static encryptWithAES(text) {
    const passphrase = '123'; // Replace with a secure passphrase
    const hash = crypto.createHmac('sha256', passphrase).update(text).digest('hex');
    return hash;
  }
}
