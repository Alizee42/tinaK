const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post("/api/contact", async (req, res) => {
  if (missingEnv.length) {
    return res.status(500).json({
      error: `Configuration SMTP manquante: ${missingEnv.join(", ")}. Creez un fichier .env.`
    });
  }

  const {
    fullName = "",
    email = "",
    phone = "",
    availability = "",
    details = "",
    services = []
  } = req.body || {};

  const cleanName = String(fullName).trim();
  const cleanEmail = String(email).trim();
  const cleanPhone = String(phone).trim() || "Non renseigne";
  const cleanAvailability = String(availability).trim() || "Non renseigne";
  const cleanDetails = String(details).trim() || "Non renseigne";
  const cleanServices = Array.isArray(services)
    ? services.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (!cleanName || !cleanEmail) {
    return res.status(400).json({ error: "Nom et e-mail requis." });
  }

  if (!cleanServices.length) {
    return res.status(400).json({ error: "Au moins un service est requis." });
  }

  const toAddress = process.env.MAIL_TO || process.env.SMTP_USER;
  if (!toAddress) {
    return res.status(500).json({ error: "Adresse de destination absente." });
  }

  const subject = `Demande de service - ${cleanName}`;
  const serviceBadges = cleanServices
    .map(
      (s) =>
        `<span style="display:inline-block;margin:0 8px 8px 0;padding:7px 12px;border-radius:999px;background:#f8efe4;border:1px solid #ead8c5;color:#5c4634;font-size:13px;line-height:1.2;">${escapeHtml(
          s
        )}</span>`
    )
    .join("");

  const html = `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Nouvelle demande</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f1ea;">
    <div style="margin:0;padding:28px 14px;font-family:Arial,Helvetica,sans-serif;color:#2c241d;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:700px;margin:0 auto;">
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fffdfa;border:1px solid #e8d8c8;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:24px 26px 18px 26px;border-bottom:1px solid #ead8c5;background:#efe2d3;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7c5a40;">Tina.k</div>
                  <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.2;color:#2d2016;">Nouvelle demande de service</h1>
                  <p style="margin:8px 0 0 0;font-size:14px;line-height:1.5;color:#6c5a4b;">Un client a rempli le formulaire depuis la modale du site.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 26px 8px 26px;">
                  <h2 style="margin:0 0 10px 0;font-size:16px;color:#3d2e22;">Informations client</h2>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e8d8c8;border-radius:10px;background:#fffdfa;">
                    <tr>
                      <td style="padding:11px 14px;width:36%;font-size:13px;color:#7d6651;background:#f6ede3;">Nom</td>
                      <td style="padding:11px 14px;font-size:14px;color:#2c241d;"><strong>${escapeHtml(cleanName)}</strong></td>
                    </tr>
                    <tr>
                      <td style="padding:11px 14px;width:36%;font-size:13px;color:#7d6651;background:#f6ede3;border-top:1px solid #e8d8c8;">E-mail</td>
                      <td style="padding:11px 14px;font-size:14px;color:#2c241d;border-top:1px solid #e8d8c8;">${escapeHtml(cleanEmail)}</td>
                    </tr>
                    <tr>
                      <td style="padding:11px 14px;width:36%;font-size:13px;color:#7d6651;background:#f6ede3;border-top:1px solid #e8d8c8;">Telephone</td>
                      <td style="padding:11px 14px;font-size:14px;color:#2c241d;border-top:1px solid #e8d8c8;">${escapeHtml(cleanPhone)}</td>
                    </tr>
                    <tr>
                      <td style="padding:11px 14px;width:36%;font-size:13px;color:#7d6651;background:#f6ede3;border-top:1px solid #e8d8c8;">Disponibilites</td>
                      <td style="padding:11px 14px;font-size:14px;color:#2c241d;border-top:1px solid #e8d8c8;">${escapeHtml(cleanAvailability)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 26px 8px 26px;">
                  <h2 style="margin:0 0 10px 0;font-size:16px;color:#3d2e22;">Services demandes</h2>
                  <div style="border:1px solid #e8d8c8;border-radius:10px;background:#fffdfa;padding:12px 14px;">
                    ${serviceBadges}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 26px 22px 26px;">
                  <h2 style="margin:0 0 10px 0;font-size:16px;color:#3d2e22;">Details</h2>
                  <div style="border:1px solid #e8d8c8;border-radius:10px;background:#fffdfa;padding:14px;font-size:14px;line-height:1.65;color:#3f3329;">
                    ${escapeHtml(cleanDetails).replace(/\n/g, "<br />")}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 26px;border-top:1px solid #ead8c5;font-size:12px;color:#7d6651;background:#faf3eb;">
                  Message genere automatiquement depuis le site Tina.k.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toAddress,
      replyTo: cleanEmail,
      subject,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Mail send error:", error);
    return res.status(500).json({ error: "Echec envoi e-mail." });
  }
});

app.get("*", (_req, res) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  if (missingEnv.length) {
    console.error(
      `Missing environment variables: ${missingEnv.join(", ")}. Create a .env file from .env.example.`
    );
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

