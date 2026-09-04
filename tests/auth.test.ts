import { 
  formatPhoneNumber, 
  deriveAuthEmailFromPhone, 
  validatePasswordStrength, 
  validateFullName 
} from '../src/lib/authHelpers';
import { 
  recordRegisteredAccount, 
  getStoredRegisteredUsers, 
  findRegisteredAccountByPhone 
} from '../src/lib/supabase';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING FINDBACK AUTH UNIT TESTS ---');

// ==========================================
// 1. Phone Number Validation & E.164 Formatting
// ==========================================
console.log('\n[Suite 1: Phone Number Formatting]');

const testPhone1 = formatPhoneNumber('9840012345');
assert(testPhone1.isValid === true, '10-digit raw mobile number is valid');
assert(testPhone1.e164 === '+919840012345', `Standardized to +919840012345 (got ${testPhone1.e164})`);
assert(testPhone1.digitsOnly === '919840012345', 'Clean digit extraction is exact');

const testPhone2 = formatPhoneNumber('+91 98400 12345');
assert(testPhone2.isValid === true, '+91 spaced input is valid');
assert(testPhone2.e164 === '+919840012345', 'Normalizes spaced +91 input');

const testPhone3 = formatPhoneNumber('098400 12345');
assert(testPhone3.isValid === true, 'Leading 0 prefix is stripped and normalized');
assert(testPhone3.e164 === '+919840012345', 'Normalized leading 0 to +91');

const testPhoneInvalid = formatPhoneNumber('12345');
assert(testPhoneInvalid.isValid === false, 'Short phone number is correctly marked invalid');
assert(Boolean(testPhoneInvalid.errorMessage), 'Provides descriptive error message for short number');

const testPhoneLetters = formatPhoneNumber('98400abcd5');
assert(testPhoneLetters.isValid === false, 'Alphanumeric phone is marked invalid');

// ==========================================
// 2. Supabase Deterministic Email Derivation
// ==========================================
console.log('\n[Suite 2: Auth Email Derivation]');

const derivedEmail1 = deriveAuthEmailFromPhone('+919840012345');
assert(derivedEmail1 === '919840012345@phone.findback.network', `Derived email matches 919840012345@phone.findback.network (got ${derivedEmail1})`);

const derivedEmail2 = deriveAuthEmailFromPhone('98400 12345');
assert(derivedEmail2 === '919840012345@phone.findback.network', `Cleaned non-E.164 input still yields canonical email (got ${derivedEmail2})`);

// ==========================================
// 3. Password Strength Validation
// ==========================================
console.log('\n[Suite 3: Password Strength Validation]');

const weakPass1 = validatePasswordStrength('123');
assert(weakPass1.isValid === false, 'Short password (<6 chars) is rejected');
assert(weakPass1.score <= 1, 'Short password receives score <= 1');

const fairPass = validatePasswordStrength('secret12');
assert(fairPass.isValid === true, '6+ char alphanumeric password passes');
assert(fairPass.score >= 2, 'Decent password receives score >= 2');

const strongPass = validatePasswordStrength('FindBack#2026Secure!');
assert(strongPass.isValid === true, 'Complex password passes');
assert(strongPass.score >= 4, 'High complexity receives score of 4');
assert(strongPass.label === 'Strong', 'High complexity labeled Strong');

// ==========================================
// 4. Full Name Validation
// ==========================================
console.log('\n[Suite 4: Name Validation]');

const validName = validateFullName('Priya Raghavan');
assert(validName.isValid === true, 'Standard full name is valid');

const invalidName = validateFullName('A');
assert(invalidName.isValid === false, 'Single character name is rejected');

// ==========================================
// 5. Account Ledger & Duplicate Detection
// ==========================================
console.log('\n[Suite 5: Account Ledger & Duplicate Handling]');

const mockAccount = {
  id: 'user_test_9840012345',
  auth_id: 'auth_test_9840012345',
  phone: '+91 98400 12345',
  e164_phone: '+919840012345',
  name: 'Test Finder',
  email: '919840012345@phone.findback.network',
  role_default: 'FINDER' as const,
  created_at: new Date().toISOString()
};

recordRegisteredAccount(mockAccount);
const accounts = getStoredRegisteredUsers();
const found = accounts.find(a => a.e164_phone === '+919840012345');
assert(Boolean(found), 'Registered account is persisted in ledger');
assert(found?.name === 'Test Finder', 'Account data correctly preserved');

const lookup = findRegisteredAccountByPhone('9840012345');
assert(Boolean(lookup), 'Lookup resolves across formatting variations');

console.log('\n--- ALL FINDBACK AUTH UNIT TESTS PASSED (100%) ---');
