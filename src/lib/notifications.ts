/**
 * FindBack — Hyperlocal Lost & Found Network for Chennai
 * Owner Email Notification Simulation Engine
 * 
 * Simulates asynchronous email notifications dispatched to item owners
 * when a matching lost item is reported found and assigned to a custody hub.
 */

export interface OwnerEmailNotificationPayload {
  ownerEmail: string;
  ownerName?: string;
  itemName: string;
  itemCategory: string;
  hubName: string;
  hubAddress: string;
  claimCode: string;
  photoUrl?: string;
  finderNotes?: string;
}

export interface DispatchedNotificationRecord {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  itemCategory: string;
  hubName: string;
  claimCode: string;
  previewHtml: string;
  status: 'DELIVERED_SIMULATED' | 'FAILED';
}

const LOCAL_STORAGE_KEY = 'findback_simulated_email_notifications';

/**
 * Retrieves the log of simulated email dispatches from local storage.
 */
export function getSimulatedNotificationLogs(): DispatchedNotificationRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Appends a dispatched notification to the persistent preview log.
 */
function recordDispatchedEmail(record: DispatchedNotificationRecord) {
  try {
    const current = getSimulatedNotificationLogs();
    const updated = [record, ...current].slice(0, 30); // Keep latest 30
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event so UI components can re-render reactively
    window.dispatchEvent(new CustomEvent('findback:email-dispatched', { detail: record }));
  } catch (err) {
    console.error('Failed to save email notification log:', err);
  }
}

/**
 * Simulates sending an official email alert to an item owner.
 * Returns a simulated message response along with rendered HTML preview.
 */
export async function simulateEmailNotificationToOwner(
  payload: OwnerEmailNotificationPayload
): Promise<{
  success: boolean;
  messageId: string;
  timestamp: string;
  previewHtml: string;
  subject: string;
}> {
  // Artificial network latency for realistic async feel
  await new Promise((resolve) => setTimeout(resolve, 800));

  const timestamp = new Date().toISOString();
  const messageId = `msg_fb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const ownerName = payload.ownerName || 'Valued Resident';
  const subject = `[FindBack Chennai Alert] Potential match found for your ${payload.itemCategory} at ${payload.hubName}`;

  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #060612; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 580px; margin: 0 auto; background: #0c0f24; border: 1px solid #6366f1; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 24px; text-align: center; border-bottom: 2px solid #06b6d4; }
          .arc-reactor { display: inline-block; width: 44px; height: 44px; border-radius: 50%; border: 2px solid #06b6d4; background: radial-gradient(circle, #38bdf8 0%, #06b6d4 40%, #090b20 80%); box-shadow: 0 0 15px #06b6d4; margin-bottom: 8px; }
          .title { font-size: 22px; font-weight: bold; color: #ffffff; margin: 0; }
          .subtitle { font-size: 13px; color: #a5b4fc; margin-top: 4px; }
          .content { padding: 24px; line-height: 1.6; font-size: 14px; }
          .item-card { background: #131738; border: 1px solid #3730a3; border-radius: 12px; padding: 16px; margin: 16px 0; }
          .tag { display: inline-block; padding: 4px 10px; background: #6366f1; color: white; border-radius: 999px; font-weight: bold; font-size: 11px; }
          .hub-box { background: #082f49; border-left: 4px solid #06b6d4; padding: 12px 16px; border-radius: 8px; margin-top: 12px; }
          .cta-btn { display: inline-block; background: #06b6d4; color: #060612; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 10px; box-shadow: 0 0 15px rgba(6,182,212,0.4); text-align: center; margin-top: 16px; }
          .footer { padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e1b4b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="arc-reactor"></div>
            <h1 class="title">FindBack Chennai</h1>
            <p class="subtitle">Hyperlocal Lost & Found Recovery Network</p>
          </div>
          <div class="content">
            <p>Dear <strong>${ownerName}</strong>,</p>
            <p>Good news! An item matching your reported loss has been registered and deposited by a verified community finder.</p>
            
            <div class="item-card">
              <span class="tag">${payload.itemCategory.toUpperCase()}</span>
              <h3 style="margin: 8px 0 4px 0; color: #ffffff;">${payload.itemName}</h3>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">Security Verification Code: <strong style="color: #38bdf8;">${payload.claimCode}</strong></p>
              ${payload.finderNotes ? `<p style="margin-top: 8px; font-size: 12px; color: #cbd5e1;"><em>Finder Note: "${payload.finderNotes}"</em></p>` : ''}
            </div>

            <div class="hub-box">
              <strong style="color: #38bdf8;">Safely Deposited at Custody Hub:</strong>
              <div style="font-weight: bold; color: #ffffff; margin-top: 4px;">${payload.hubName}</div>
              <div style="font-size: 12px; color: #94a3b8;">${payload.hubAddress}</div>
              <div style="font-size: 12px; color: #38bdf8; margin-top: 4px;">⏱️ Custody Operating Hours: 8:00 AM - 10:00 PM Daily</div>
            </div>

            <p style="margin-top: 20px;">
              To protect your privacy, item photos are masked until verified. Click below to verify ownership via your FindBack dashboard:
            </p>

            <center>
              <a href="#claim" class="cta-btn">View Item & Claim Ownership</a>
            </center>
          </div>
          <div class="footer">
            FindBack Chennai • 100% Escrow & Aadhaar Masked Verification • INNOVARA '26 Pitch
          </div>
        </div>
      </body>
    </html>
  `.trim();

  const record: DispatchedNotificationRecord = {
    id: messageId,
    timestamp,
    recipientEmail: payload.ownerEmail,
    recipientName: ownerName,
    subject,
    itemCategory: payload.itemCategory,
    hubName: payload.hubName,
    claimCode: payload.claimCode,
    previewHtml,
    status: 'DELIVERED_SIMULATED',
  };

  recordDispatchedEmail(record);

  return {
    success: true,
    messageId,
    timestamp,
    previewHtml,
    subject,
  };
}
