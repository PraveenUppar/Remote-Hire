import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

// Created a webhook that listens to the clerk webhook events when user is created and store it in convex
// Created a webhook endpoint in the clerk dashboard and set the endpoint to /clerk-webhook
// Created a env variable in the convex dashboard called CLERK_WEBHOOK_SECRET

// When the user is created in clerk, the webhook will be triggered and the user will be created in convex

const http = httpRouter();

// HHTP route that sends a post request to the clerk webhook
http.route({
  path: "/clerk-webhook",
  method: "POST",
  // 
  handler: httpAction(async (ctx, request) => {
    // Get the webhook secret from the environment variable
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    // svix is Webhook as a service
    // svix is used to verify the webhook signature
    // svix is used to verify the webhook id
    // svix is used to verify the webhook timestamp

    // Read the svix headers from the request
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    // Check if the svix headers are present
    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    // Check if the request body is present
    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    // Verify the webhook signature
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    // Create a event type
    const eventType = evt.type;
    // Check if the event type is user.created
    if (eventType === "user.created") {
      // Define the user object for the user created event
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      // Check if the user already exists in convex if not create the user
      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
