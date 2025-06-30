import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Configure authenticator
authenticator.options = {
  window: 1, // Allow 1 step before and after the current step (30 seconds window)
};

/**
 * Generate a new TOTP secret
 * @returns The generated secret
 */
export function generateSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a set of backup codes
 * @param count Number of backup codes to generate
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 8-character code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Generate a QR code for the TOTP secret
 * @param secret The TOTP secret
 * @param email The user's email
 * @param issuer The issuer name (app name)
 * @returns A data URL for the QR code
 */
export async function generateQRCode(
  secret: string,
  email: string,
  issuer: string = 'Aithor'
): Promise<string> {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return QRCode.toDataURL(otpauth);
}

/**
 * Verify a TOTP token
 * @param token The token to verify
 * @param secret The TOTP secret
 * @returns Whether the token is valid
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    return false;
  }
}

/**
 * Verify a backup code
 * @param code The backup code to verify
 * @param backupCodes The list of valid backup codes
 * @returns Whether the code is valid and the updated list of backup codes (with the used code removed)
 */
export function verifyBackupCode(
  code: string,
  backupCodes: string[]
): { valid: boolean; updatedCodes: string[] } {
  // Normalize the code format
  const normalizedCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;

  // Check if the code exists in the backup codes
  const codeIndex = backupCodes.findIndex(c => c === formattedCode);
  
  if (codeIndex === -1) {
    return { valid: false, updatedCodes: backupCodes };
  }

  // Remove the used code from the list
  const updatedCodes = [...backupCodes];
  updatedCodes.splice(codeIndex, 1);

  return { valid: true, updatedCodes };
}

/**
 * Hash a backup code for storage
 * @param code The backup code to hash
 * @returns The hashed backup code
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify a hashed backup code
 * @param code The backup code to verify
 * @param hashedCodes The list of hashed backup codes
 * @returns Whether the code is valid and the updated list of hashed backup codes (with the used code removed)
 */
export function verifyHashedBackupCode(
  code: string,
  hashedCodes: string[]
): { valid: boolean; updatedCodes: string[] } {
  // Normalize the code format
  const normalizedCode = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const formattedCode = `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4)}`;
  
  // Hash the code
  const hashedCode = hashBackupCode(formattedCode);
  
  // Check if the hashed code exists in the hashed backup codes
  const codeIndex = hashedCodes.findIndex(c => c === hashedCode);
  
  if (codeIndex === -1) {
    return { valid: false, updatedCodes: hashedCodes };
  }

  // Remove the used code from the list
  const updatedCodes = [...hashedCodes];
  updatedCodes.splice(codeIndex, 1);

  return { valid: true, updatedCodes };
}
