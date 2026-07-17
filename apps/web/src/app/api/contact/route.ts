export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    console.error("GOOGLE_SCRIPT_URL is not configured");
    return Response.json({ success: false, error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return Response.json({ success: false, error: "Upstream submission failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("Failed to forward request to Google Script:", err);
    return Response.json({ success: false, error: "Failed to submit" }, { status: 502 });
  }

  return Response.json({ success: true });
}