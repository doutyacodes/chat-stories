"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "955939134928-t9ckaupvmivajosfbjru7v7is4a4rotf.apps.googleusercontent.com";

export default function GoogleAuthButton({
  text = "Continue with Google",
  onSuccess,
  onError,
  disabled = false,
}) {
  const buttonRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setIsScriptLoaded(true);
    }
  }, []);

  const handleCredentialResponse = useCallback(
    async (response) => {
      setIsLoading(true);
      try {
        if (response.credential) {
          await onSuccess?.(response.credential);
        } else {
          throw new Error("No credential received from Google");
        }
      } catch (err) {
        console.error("Google Auth error:", err);
        onError?.(err.message || "Google authentication failed");
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const initGoogle = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (buttonRef.current) {
      const containerWidth = buttonRef.current.offsetWidth || 380;
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: text.toLowerCase().includes("sign up") ? "signup_with" : "signin_with",
        logo_alignment: "left",
        width: Math.max(250, Math.min(containerWidth, 400)),
      });
    }
  }, [handleCredentialResponse, text]);

  useEffect(() => {
    if (isScriptLoaded) {
      initGoogle();
    }
  }, [isScriptLoaded, initGoogle]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className="w-full relative">
        <div
          ref={buttonRef}
          className={`w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full [&>div>iframe]:!mx-auto ${
            isLoading || disabled ? "opacity-60 pointer-events-none" : ""
          }`}
        />

        {/* Fallback button while Google Identity script loads */}
        {!isScriptLoaded && (
          <button
            type="button"
            disabled={true}
            className="w-full py-3 px-4 rounded bg-gray-700 text-white text-sm font-semibold flex items-center justify-center gap-3 opacity-75 cursor-not-allowed border border-gray-600"
          >
            <GoogleIcon />
            <span>Loading Google...</span>
          </button>
        )}
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}
