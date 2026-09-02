const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char] || char);
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://axitrades.com").replace(/\/$/, "");
}

function layout(title: string, preheader: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f7f5f1;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f1;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border:1px solid #e8e4de;border-radius:18px;overflow:hidden"><tr><td style="padding:24px 28px;border-bottom:1px solid #eeeae4"><div style="font-size:23px;font-weight:800;letter-spacing:-.5px">Axi<span style="color:#c7192d">Trades</span></div></td></tr><tr><td style="padding:32px 28px"><h1 style="font-size:25px;line-height:1.25;margin:0 0 14px">${escapeHtml(title)}</h1>${body}</td></tr><tr><td style="padding:20px 28px;background:#faf9f7;color:#777;font-size:12px;line-height:1.7">This is an automated account notification from AxiTrades. We will never ask you to disclose your password, authentication codes, or private keys by email. If you did not initiate this activity, contact support immediately.</td></tr></table><div style="max-width:640px;padding:18px 12px;color:#888;font-size:11px;line-height:1.6;text-align:center">© AxiTrades. Please do not reply to this automated message.</div></td></tr></table></body></html>`;
}

function button(label: string, href: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#c7192d;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:9px">${escapeHtml(label)}</a></p>`;
}

function detailTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e4de;border-radius:12px;margin:22px 0;overflow:hidden">${rows.map(([label, value]) => `<tr><td style="padding:12px 14px;border-bottom:1px solid #eeeae4;color:#777;font-size:13px">${escapeHtml(label)}</td><td style="padding:12px 14px;border-bottom:1px solid #eeeae4;text-align:right;font-weight:700;font-size:14px">${escapeHtml(value)}</td></tr>`).join("")}</table>`;
}

export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Email not sent: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured.");
    return false;
  }
  try {
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
  } catch (error) {
    console.error("Resend email request failed:", error);
    return false;
  }
}

export async function sendWelcomeEmail(user: { email: string; firstName: string }) {
  const name = escapeHtml(user.firstName || "there");
  return sendEmail({
    to: user.email,
    subject: "Welcome to AxiTrades",
    html: layout("Welcome to AxiTrades", "Your AxiTrades account has been created successfully.", `<p style="font-size:16px;line-height:1.7">Hello ${name},</p><p style="font-size:16px;line-height:1.7">Your AxiTrades account is ready. Sign in to complete your profile, review your account details, and submit verification documents when required.</p>${button("Open AxiTrades", `${appUrl()}/dashboard/`)}<p style="font-size:13px;line-height:1.7;color:#666">If you did not create this account, contact support immediately.</p>`),
  });
}

export async function sendTransactionEmail(user: { email: string; firstName: string }, kind: "deposit" | "withdrawal", status: "pending" | "completed" | "rejected", amount: string, currency: string, reason?: string) {
  const action = kind === "deposit" ? "Deposit" : "Withdrawal";
  const statusLabel = status === "completed" ? "Completed" : status === "rejected" ? "Rejected" : "Received and pending review";
  const message = status === "completed" ? `Your ${action.toLowerCase()} has been completed and the transaction record has been updated.` : status === "rejected" ? `Your ${action.toLowerCase()} was rejected. ${reason || "Please review the transaction in your dashboard or contact support."}` : `We received your ${action.toLowerCase()} request. It remains pending until the required payment or compliance review is completed.`;
  return sendEmail({
    to: user.email,
    subject: `${action} ${status === "completed" ? "confirmed" : status === "rejected" ? "update" : "received"} — AxiTrades`,
    html: layout(`${action} ${statusLabel}`, `${action} update for your AxiTrades account.`, `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">${escapeHtml(message)}</p>${detailTable([["Amount", `${amount} ${currency}`],["Status", statusLabel]])}${button("View dashboard", `${appUrl()}/dashboard/`)}`),
  });
}

export async function sendKycSubmittedEmail(user: { email: string; firstName: string }) {
  return sendEmail({
    to: user.email,
    subject: "Verification documents received — AxiTrades",
    html: layout("Verification documents received", "Your verification submission is now pending review.", `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">We received your verification documents. Your KYC status is now <strong>pending review</strong>. We will notify you when a compliance decision is recorded.</p>${button("Review verification", `${appUrl()}/dashboard/`)}`),
  });
}

export async function sendKycDecisionEmail(user: { email: string; firstName: string }, status: "approved" | "rejected" | "pending", reason?: string) {
  const title = status === "approved" ? "Verification approved" : status === "rejected" ? "Verification update" : "Verification remains pending";
  const message = status === "approved" ? "Your identity verification has been approved." : status === "rejected" ? `Your identity verification was not approved at this time. ${reason || "Please review the requirements in your account and submit updated documents if requested."}` : "Your verification is still under review.";
  return sendEmail({
    to: user.email,
    subject: `${title} — AxiTrades`,
    html: layout(title, "An update is available for your AxiTrades verification.", `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">${escapeHtml(message)}</p>${button("Open account", `${appUrl()}/dashboard/`)}`),
  });
}
