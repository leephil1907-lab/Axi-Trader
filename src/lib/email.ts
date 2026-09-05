const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char] || char);
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://axitrades.com").replace(/\/$/, "");
}

function layout(title: string, preheader: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#282424"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;margin:0 auto"><tr><td style="padding:26px 32px;border-bottom:4px solid #e4002e"><div style="font-size:30px;font-weight:900;letter-spacing:-2px;color:#e4002e;line-height:1">axi<span style="color:#282424">trades</span></div></td></tr><tr><td style="padding:36px 32px 8px"><h1 style="font-size:30px;line-height:1.15;margin:0 0 16px;letter-spacing:-.5px;color:#0b0b0c">${escapeHtml(title)}</h1>${body}</td></tr><tr><td style="padding:8px 32px 36px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ececee;margin-top:12px"><tr><td style="padding:18px 0 0;color:#6d6d6f;font-size:12px;line-height:1.7">This is an automated account notification from AxiTrades. We will never ask you to disclose your password, authentication codes, or private keys by email. If you did not initiate this activity, contact support immediately.</td></tr></table></td></tr><tr><td style="background:#0b0b0c;padding:26px 32px"><div style="font-size:20px;font-weight:900;letter-spacing:-1px;color:#e4002e;line-height:1;margin-bottom:12px">axi</div><p style="margin:0;color:#8a8a8e;font-size:10.5px;line-height:1.7">Trading leveraged products carries a high level of risk and may not be suitable for all investors. You may lose substantially more than your initial investment.</p><p style="margin:14px 0 0;color:#5c5c60;font-size:11px;line-height:1.6">© AxiTrades · www.axitrades.com · Please do not reply to this automated message.</p></td></tr></table></td></tr></table></body></html>`;
}

function button(label: string, href: string): string {
  return `<p style="margin:28px 0 8px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#e4002e;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:15px 30px;border-radius:6px">${escapeHtml(label)}</a></p>`;
}

function detailTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #ececee;border-radius:12px;margin:24px 0;overflow:hidden">${rows.map(([label, value]) => `<tr><td style="padding:13px 16px;border-bottom:1px solid #ececee;color:#6d6d6f;font-size:13px">${escapeHtml(label)}</td><td style="padding:13px 16px;border-bottom:1px solid #ececee;text-align:right;font-weight:800;font-size:14px;color:#0b0b0c">${escapeHtml(value)}</td></tr>`).join("")}</table>`;
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

export async function sendWelcomeEmail(user: { email: string; firstName: string | null | undefined }) {
  const name = escapeHtml(user.firstName || "there");
  return sendEmail({
    to: user.email,
    subject: "Welcome to AxiTrades",
    html: layout("Welcome to AxiTrades", "Your AxiTrades account has been created successfully.", `<p style="font-size:16px;line-height:1.7">Hello ${name},</p><p style="font-size:16px;line-height:1.7">Your AxiTrades account is ready. Sign in to complete your profile, review your account details, and submit verification documents when required.</p>${button("Open AxiTrades", `${appUrl()}/dashboard/`)}<p style="font-size:13px;line-height:1.7;color:#666">If you did not create this account, contact support immediately.</p>`),
  });
}

export async function sendTransactionEmail(user: { email: string; firstName: string | null | undefined }, kind: "deposit" | "withdrawal", status: "pending" | "completed" | "rejected", amount: string, currency: string, reason?: string) {
  const action = kind === "deposit" ? "Deposit" : "Withdrawal";
  const statusLabel = status === "completed" ? "Completed" : status === "rejected" ? "Rejected" : "Received and pending review";
  const message = status === "completed" ? `Your ${action.toLowerCase()} has been completed and the transaction record has been updated.` : status === "rejected" ? `Your ${action.toLowerCase()} was rejected. ${reason || "Please review the transaction in your dashboard or contact support."}` : `We received your ${action.toLowerCase()} request. It remains pending until the required payment or compliance review is completed.`;
  return sendEmail({
    to: user.email,
    subject: `${action} ${status === "completed" ? "confirmed" : status === "rejected" ? "update" : "received"} — AxiTrades`,
    html: layout(`${action} ${statusLabel}`, `${action} update for your AxiTrades account.`, `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">${escapeHtml(message)}</p>${detailTable([["Amount", `${amount} ${currency}`],["Status", statusLabel]])}${button("View dashboard", `${appUrl()}/dashboard/`)}`),
  });
}

export async function sendKycSubmittedEmail(user: { email: string; firstName: string | null | undefined }) {
  return sendEmail({
    to: user.email,
    subject: "Verification documents received — AxiTrades",
    html: layout("Verification documents received", "Your verification submission is now pending review.", `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">We received your verification documents. Your KYC status is now <strong>pending review</strong>. We will notify you when a compliance decision is recorded.</p>${button("Review verification", `${appUrl()}/dashboard/`)}`),
  });
}

export async function sendKycDecisionEmail(user: { email: string; firstName: string | null | undefined }, status: "approved" | "rejected" | "pending", reason?: string) {
  const title = status === "approved" ? "Verification approved" : status === "rejected" ? "Verification update" : "Verification remains pending";
  const message = status === "approved" ? "Your identity verification has been approved." : status === "rejected" ? `Your identity verification was not approved at this time. ${reason || "Please review the requirements in your account and submit updated documents if requested."}` : "Your verification is still under review.";
  return sendEmail({
    to: user.email,
    subject: `${title} — AxiTrades`,
    html: layout(title, "An update is available for your AxiTrades verification.", `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">${escapeHtml(message)}</p>${button("Open account", `${appUrl()}/dashboard/`)}`),
  });
}

export async function sendAdminNotification(title: string, preheader: string, intro: string, rows: Array<[string, string]>, ctaLabel = "Open admin dashboard"): Promise<boolean> {
  const to = (process.env.ADMIN_NOTIFICATION_EMAIL || "").trim();
  if (!to) {
    console.warn("Admin notification skipped: ADMIN_NOTIFICATION_EMAIL is not configured.");
    return false;
  }
  return sendEmail({
    to,
    subject: `${title} — AxiTrades admin`,
    html: layout(title, preheader, `<p style="font-size:15px;line-height:1.7">${escapeHtml(intro)}</p>${detailTable(rows)}${button(ctaLabel, `${appUrl()}/admin/`)}`),
  });
}

export async function sendPasswordResetEmail(user: { email: string; firstName: string | null | undefined }, code: string) {
  return sendEmail({
    to: user.email,
    subject: "Your password reset code — AxiTrades",
    html: layout("Reset your password", "Use this code to choose a new AxiTrades password. It expires in 15 minutes.", `<p style="font-size:16px;line-height:1.7">Hello ${escapeHtml(user.firstName || "there")},</p><p style="font-size:15px;line-height:1.7">Enter this code on the password reset page to choose a new password. It expires in <strong>15 minutes</strong> and can only be used once.</p><p style="margin:26px 0;text-align:center"><span style="display:inline-block;font-size:34px;font-weight:900;letter-spacing:10px;color:#0b0b0c;background:#fafafa;border:1px solid #ececee;border-radius:12px;padding:14px 20px 14px 30px">${escapeHtml(code)}</span></p><p style="font-size:13px;line-height:1.7;color:#666">If you did not request this, ignore this email — your password stays unchanged.</p>${button("Reset password", `${appUrl()}/reset-password/?email=${encodeURIComponent(user.email)}`)}`),
  });
}
