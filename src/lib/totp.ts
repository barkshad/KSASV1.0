import CryptoJS from "crypto-js";

export function generateTOTPSecret(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

function uint64ToBytes(num: bigint): number[] {
  const bytes = new Array(8).fill(0);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = Number(num & BigInt(0xff));
    num = num >> BigInt(8);
  }
  return bytes;
}

export function getTOTPToken(secret: string, timeStep: number = 30): string {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);

  const key = CryptoJS.enc.Utf8.parse(secret);
  const msg = CryptoJS.lib.WordArray.create(uint64ToBytes(BigInt(counter)));
  const hmac = CryptoJS.HmacSHA1(msg, key);
  const hmacHex = hmac.toString(CryptoJS.enc.Hex);

  const offset = parseInt(hmacHex.substr(-1), 16);
  const otp = (parseInt(hmacHex.substr(offset * 2, 8), 16) & 0x7fffffff) % 1000000;

  return otp.toString().padStart(6, "0");
}

export function validateTOTP(
  secret: string,
  token: string,
  timeStep: number = 30,
  window: number = 1
): boolean {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);

  for (let i = -window; i <= window; i++) {
    const testCounter = counter + i;
    const key = CryptoJS.enc.Utf8.parse(secret);
    const msg = CryptoJS.lib.WordArray.create(uint64ToBytes(BigInt(testCounter)));
    const hmac = CryptoJS.HmacSHA1(msg, key);
    const hmacHex = hmac.toString(CryptoJS.enc.Hex);

    const offset = parseInt(hmacHex.substr(-1), 16);
    const expected = ((parseInt(hmacHex.substr(offset * 2, 8), 16) & 0x7fffffff) % 1000000)
      .toString()
      .padStart(6, "0");

    if (expected === token) return true;
  }

  return false;
}

export function getQRCodeData(sessionId: string, token: string): string {
  return `ksas://attend?session=${sessionId}&token=${token}`;
}
