import { Inngest } from "inngest";
import User from "../models/user.js";
import Connection from "../models/connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ping-Up app" });

//ingest function to save the user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    let username = email_addresses[0].email_address.split("@")[0];

    //check username availability
    const user = await User.findOne({ username });
    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };
    await User.create(userData);
  },
);
//ingest function to update the user data to a database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };
    await User.findByIdAndUpdate(id, updatedUserData);
  },
);
//Inngest function to delete user from datbase

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

//ingest function to send reminder when a new connection request is added

const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    // Send first email
    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      if (!connection) {
        return { message: "Connection not found" };
      }

      const subject = `👋 New Connection Request`;

      const body = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:30px;">

    <h2 style="color:#333;">👋 New Connection Request</h2>

    <p style="font-size:16px; color:#555;">
      <strong>${connection.from_user_id.full_name}</strong> (@${connection.from_user_id.username})
      has sent you a connection request.
    </p>

    <p style="font-size:15px; color:#666;">
      Connect with them to start chatting and growing your network.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <a 
        href="${process.env.FRONTEND_URL}"
        style="
          background:#4f46e5;
          color:white;
          padding:12px 25px;
          text-decoration:none;
          border-radius:6px;
          font-size:16px;
          font-weight:bold;
        "
      >
        View Request
      </a>
    </div>

    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />

    <p style="font-size:13px; color:#999;">
      You received this email because someone wants to connect with you on DevConnect.
    </p>

  </div>
</div>
`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    // Wait 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    // Send reminder email if still pending
    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id",
      );

      if (!connection) {
        return { message: "Connection not found" };
      }

      if (connection.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = `Reminder: Connection Request`;

      const body = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:30px;">

    <h2 style="color:#333;">⏰ Reminder: Connection Request</h2>

    <p style="font-size:16px; color:#555;">
      <strong>${connection.from_user_id.full_name}</strong> (@${connection.from_user_id.username})
      is still waiting for your response.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <a 
        href="${process.env.FRONTEND_URL}"
        style="
          background:#4f46e5;
          color:white;
          padding:12px 25px;
          text-decoration:none;
          border-radius:6px;
          font-size:16px;
          font-weight:bold;
        "
      >
        Respond to Request
      </a>
    </div>

  </div>
</div>
`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
      return { message: "reminder sent" };
    });
  },
);

//inngest function to delete the story after 24 hours

const deleteStory = inngest.createFunction(
  { id: "story-delete" },
  { event: "app/story.delete" },
  async ({ event, step }) => {
    const { storyId } = event.data;
    const in24hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24hours);
    await step.run("delete-story", async () => {
      await Story.findByIdAndDelete(storyId);
      return { message: "story deleted" };
    });
  },
);

const sendNotificationofUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },
  { cron: "TZ=America/New_York 0 9 * * *" },
  async ({ step }) => {
    const messages = await Message.find({
      seen: false,
    }).populate("to_user_id");
    const unseenCount = {};
    messages.map((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await User.findById(userId);
      const subject = `💬 You have ${unseenCount[userId]} unseen messages`;
      const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Unseen Messages</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

    <h2 style="color:#333;">Hello ${user.full_name || user.username},</h2>

    <p style="font-size:16px; color:#555;">
      You have <strong>${unseenCount[userId]}</strong> unread message${unseenCount[userId] > 1 ? "s" : ""} waiting for you on <b>PingUp</b>.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <a href="https://your-app-link.com/messages"
         style="background:#4f46e5; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:16px;">
         View Messages
      </a>
    </div>

    <p style="font-size:14px; color:#888;">
      Stay connected and never miss an important conversation.
    </p>

    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

    <p style="font-size:12px; color:#999;">
      This email was sent because you have unread messages on PingUp.
      If you already checked them, you can ignore this email.
    </p>

  </div>
</body>
</html>
`;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }
    return {message:"Notification sent."}
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  sendNotificationofUnseenMessages,deleteStory
];
