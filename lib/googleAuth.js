/**
 * Verify Google ID token using Google's tokeninfo endpoint
 * @param {string} idToken
 * @returns {Promise<{ email: string, name: string, picture: string, sub: string }>}
 */
export async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw new Error("Missing Google ID token");
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error_description || "Invalid Google ID token");
  }

  const payload = await res.json();

  // Validate audience if client ID is configured
  if (clientId && payload.aud !== clientId) {
    throw new Error("Google token audience mismatch");
  }

  // Ensure email is verified
  if (payload.email_verified === "false" || payload.email_verified === false) {
    throw new Error("Google email is not verified");
  }

  return {
    email: payload.email,
    name: payload.name || payload.given_name || payload.email?.split("@")[0] || "User",
    picture: payload.picture || null,
    sub: payload.sub,
  };
}
