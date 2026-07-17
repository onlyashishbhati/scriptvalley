import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path:   "/clerk-webhook",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret)
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");

    const svix_id        = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp)
      return new Response("Missing svix headers", { status: 400 });

    const payload = await request.json();
    const body    = JSON.stringify(payload);
    const wh      = new Webhook(webhookSecret);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id":        svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Verification error", { status: 400 });
    }

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      // Defensive: some Clerk payloads (e.g. OAuth without a verified email)
      // can arrive with an empty email_addresses array — don't crash the webhook.
      const email = email_addresses?.[0]?.email_address ?? "";
      const name  = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, { userId: id, email, name });
      } catch (error) {
        console.error("Failed to sync new user:", error);
        return new Response("User sync failed", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;