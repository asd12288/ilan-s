import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "study_session";

const issuer = "ilan-study-dashboard";
const audience = "ilan-study-dashboard";

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  secret: string,
  maxAgeSeconds = 60 * 60 * 24 * 30,
): Promise<string> {
  if (!secret) throw new Error("SESSION_SECRET is required");

  return new SignJWT({ owner: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(key(secret));
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false;

  try {
    await jwtVerify(token, key(secret), { issuer, audience });
    return true;
  } catch {
    return false;
  }
}
