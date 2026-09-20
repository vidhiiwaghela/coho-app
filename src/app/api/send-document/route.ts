import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER || process.env.ADMIN_EMAIL;
const emailPass = process.env.EMAIL_PASS || process.env.ADMIN_EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: emailUser,
    pass: emailPass?.replace(/\s+/g, ""), // strip any spaces from app password
  },
});

export async function POST(req: NextRequest) {
  try {
    let toEmail = "";
    let documentTitle = "Official Document";
    let flatNumber = "N/A";
    let residentName = "Resident";
    let fileName = "";
    let attachmentBuffer: Buffer | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      toEmail = (body.toEmail || body.to || body.deliveryEmail || "").trim();
      documentTitle = (body.documentTitle || "Official Document").trim();
      flatNumber = (body.flatNumber || "N/A").trim();
      residentName = (body.residentName || "Resident").trim();
      fileName = (body.fileName || "").trim();

      if (body.fileBase64) {
        attachmentBuffer = Buffer.from(
          body.fileBase64.replace(/^data:[^;]+;base64,/, ""),
          "base64"
        );
      }
    } else {
      const formData = await req.formData();
      toEmail = (
        (formData.get("toEmail") as string) ||
        (formData.get("to") as string) ||
        (formData.get("deliveryEmail") as string) ||
        ""
      ).trim();
      documentTitle = (
        (formData.get("documentTitle") as string) || "Official Document"
      ).trim();
      flatNumber = ((formData.get("flatNumber") as string) || "N/A").trim();
      residentName = ((formData.get("residentName") as string) || "Resident").trim();

      const file = formData.get("file") as File | null;
      if (file) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        attachmentBuffer = Buffer.from(arrayBuffer);
      }
    }

    console.log("Using sender:", emailUser);
    console.log("Pass exists:", !!emailPass);
    console.log("Sending to:", toEmail);

    if (!toEmail) {
      return Response.json(
        { error: "Recipient email address (toEmail) is required." },
        { status: 400 }
      );
    }

    if (!emailUser || !emailPass) {
      console.error("EMAIL_USER or EMAIL_PASS is missing in environment variables.");
      return Response.json(
        { error: "EMAIL_USER or EMAIL_PASS is not configured in .env.local" },
        { status: 500 }
      );
    }

    // Indian standard timestamp
    const now = new Date();
    const issueDate =
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

    // Branded CoHo Slate-Navy & Warm Cream HTML Template
    const brandedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - Emerald Heights CHS Ltd.</title>
</head>
<body style="margin:0;padding:0;background-color:#0A1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#F3F5F9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1120;padding:36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;width:100%;background-color:#111C2E;border:1px solid #22304A;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px 28px;background-color:#111C2E;border-bottom:1px solid #22304A;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8C97AD;">
                      CoHo Smart Portal • Official Notice
                    </span>
                    <h1 style="margin:6px 0 0 0;font-size:21px;font-weight:800;color:#EFE4CC;letter-spacing:-0.3px;">
                      Emerald Heights CHS Ltd.
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;padding:5px 12px;background-color:#16233A;border:1px solid rgba(79,209,161,0.3);border-radius:20px;font-size:11px;font-weight:700;color:#4FD1A1;white-space:nowrap;">
                      ✓ Fulfilled
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#F3F5F9;">
                Dear <strong>${residentName}</strong>,
              </p>
              <p style="margin:0 0 22px 0;font-size:14px;line-height:1.6;color:#8C97AD;">
                Your requested society document <strong>${documentTitle}</strong> for Flat <strong>${flatNumber}</strong> has been approved, verified, and is attached to this email.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#16233A;border-radius:14px;border:1px solid #22304A;margin-bottom:24px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#8C97AD;">Document Issued</div>
                    <div style="font-size:16px;font-weight:800;color:#EFE4CC;margin-top:2px;">${documentTitle}</div>
                    <div style="font-size:12px;color:#8C97AD;margin-top:6px;">Unit: Flat ${flatNumber} • Recipient: ${toEmail} • Issued: ${issueDate}</div>
                    ${fileName ? `<div style="font-size:13px;color:#F3F5F9;margin-top:8px;">📎 <strong>${fileName}</strong> attached</div>` : ""}
                  </td>
                </tr>
              </table>
              <div style="background-color:rgba(10,17,32,0.7);border-left:4px solid #EFE4CC;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                <p style="margin:0;font-size:13px;color:#F3F5F9;">
                  <strong>Official Verification:</strong> This digital copy contains the verified society reference seal. You may print or forward this file for banking, registration, or municipal procedures.
                </p>
              </div>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#8C97AD;">
                If you have any questions or require an additional stamped hardcopy, please contact the Society Office or reach out to the Secretary via the CoHo Helpdesk.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background-color:#0A1120;border-top:1px solid #22304A;text-align:center;">
              <p style="margin:0;font-size:11px;color:#8C97AD;">
                Emerald Heights CHS Ltd. • Seawoods, Navi Mumbai 400706
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"Emerald Heights CHS Ltd." <${emailUser}>`,
        to: toEmail,
        subject: `Official Document Issued: ${documentTitle} - Flat ${flatNumber}`,
        html: brandedHtml,
        attachments:
          attachmentBuffer && fileName
            ? [
                {
                  filename: fileName,
                  content: attachmentBuffer,
                },
              ]
            : [],
      });

      console.log("Email sent successfully:", info.messageId);
      return Response.json({ success: true, messageId: info.messageId });
    } catch (err: unknown) {
      console.error("Nodemailer error:", err);
      const msg = err instanceof Error ? err.message : "Failed to dispatch email";
      return Response.json({ error: msg }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("Server error in send-document handler:", err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
