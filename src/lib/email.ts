const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char] || char);
}

function layout(title: string, preheader: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f5f1;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f1;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border:1px solid #e8e4de;border-radius:18px;overflow:hidden"><tr><td style="padding:24px 28px;border-bottom:1px solid #eeeae4"><div style="font-size:22px;font-weight:800;letter-spacing:-.4px">Axi<span style="color:#c7192d">Trades</span></div></td></tr><tr><td style="padding:32px 28px"><h1 style="font-size:25px;margin:0 0 14px">${escapeHtml(title)}</h1>${body}</td></tr><tr><td style="padding:20px 28px;background:#faf9f7;color:#777;font-size:12px;line-height:1.6">This is an automated account notification from AxiTrades. For security, never share your password or verification codes by email.</td></tr></table></td></tr></table></body></html>`;
}

export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Email not sent: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return false;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [options.to], subject: options.subject, html: options.html }),
  });
  if (!response.ok) {
    console.error("Resend email failed:", response.status, await response.text());
    return false;
  }
  return true;
}

export async function sendWelcomeEmail(user: { email: string; firstName: string }) {
  const name = escapeHtml(user.firstName || "there");
  return sendEmail({
    to: user.email,
    subject: "Welcome to AxiTrades",
    html: layout("Welcome to AxiTrades", "Your account has been created successfully.", `<p style="font-size:16px;line-height:1.7">Hello ${name},</p><p style="font-size:16px;line-height:1.7">Your AxiTrades account has been created successfully. You can now sign in, complete your profile and submit verification documents when required.</p><p style="font-size:14px;line-height:1.7;color:#666">If you did not create this account, contact support immediately.</p>`),
  });
}

export async function sendTransactionEmail(user: { email: string; firstName: string }, kind: "deposit" | "withdrawal", status: "pending" | "completed" | "rejected", amount: string, currency: string) {
  const action = kind === "deposit" ? "Deposit" : "Withdrawal";
  const statusLabel = status === "completed" ? "Completed" : status === "rejected" ? "Rejected" : "Received and pending review";
  return sendEmail({
    to: user.email,
    subject: `${action} ${status === "completed" ? "confirmed" : status === "rejected" ? "update" : "received"} — AxiTrades`,
    html: layout(`${action} ${statusLabel}`, `${action} update for your AxiTrades account.`, `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><table style="width:100%;border-collapse:collapse;margin:22px 0"><tr><td style="padding:10px 0;color:#777">Amount</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(amount)} ${escapeHtml(currency)}</td></tr><tr><td style="padding:10px 0;color:#777">Status</td><td style="padding:10px 0;text-align:right;font-weight:700">${statusLabel}</td></tr></table><p style="font-size:14px;line-height:1.7;color:#666">You can review the transaction in your AxiTrades dashboard.</p>`),
  });
}
