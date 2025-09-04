import fetch from "node-fetch";

export const notifySlack = async (webhookUrl, message) => {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
  } catch (err) { console.error("Slack notify error", err); }
};

export const notifyTeams = async (webhookUrl, message) => {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
  } catch (err) { console.error("Teams notify error", err); }
};
