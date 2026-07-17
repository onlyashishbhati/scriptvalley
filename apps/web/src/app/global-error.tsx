"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        <h1>Something went wrong</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}