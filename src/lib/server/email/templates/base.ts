/**
 * Base email template structure.
 * All colour values are sourced from app.css.ts (light-mode :root tokens).
 * CSS custom properties cannot be used in email clients, so resolved hex values
 * are interpolated directly into inline styles via root['--color-...'].
 *
 * Visual design mirrors the [slug] booking page:
 *  - Outer body:  --color-background  (#f3f4f1 warm off-white)
 *  - Card:        --color-surface     (#fafafa) with 20px radius + shadow
 *  - Details:     icon + text rows    (matching EventSidebar)
 *  - CTA button:  rounded-full pill   (matching "Schedule Event" button)
 */

import { root } from '$src/app.css.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BaseTemplateOptions {
	title: string;
	/** Pre-rendered SVG/HTML status badge placed at top-center of the card */
	statusBadge: string;
	/** Large heading text (e.g. "Meeting Confirmed!") */
	heading: string;
	bodyContent: string;
	footerContent: string;
}

// ---------------------------------------------------------------------------
// Base layout
// ---------------------------------------------------------------------------

export function generateBaseEmail(options: BaseTemplateOptions): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin:0;padding:0;background-color:${root['--color-background']};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Main card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${root['--color-surface']};border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Status badge + heading -->
          <tr>
            <td align="center" style="padding:40px 40px 28px;">
              ${options.statusBadge}
              <h1 style="margin:16px 0 0;font-size:26px;font-weight:700;color:${root['--color-foreground']};line-height:1.2;">${options.heading}</h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:${root['--color-surface-2']};"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${options.bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;background-color:${root['--color-surface-2']};border-top:1px solid ${root['--color-border-medium']};">
              <p style="margin:0;color:${root['--color-subtle-foreground']};font-size:12px;line-height:18px;text-align:center;">
                ${options.footerContent}<br>
                Powered by <a href="https://github.com/cnshing/CloudMeet" style="color:${root['--color-subtle-foreground']};text-decoration:underline;">CloudMeet</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /card -->

      </td>
    </tr>
  </table>

</body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Status badges (circular icon, placed at card top)
// ---------------------------------------------------------------------------

/** Green checkmark circle — confirmation / success */
export function badgeSuccess(): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${root['--color-accent-subtle']};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${root['--color-border-strong']}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
</div>`;
}

/** Neutral X circle — cancellation (no red: reserved for action buttons only) */
export function badgeCancelled(): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${root['--color-surface-2']};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
</div>`;
}

/** Accent arrows circle — reschedule */
export function badgeRescheduled(): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${root['--color-accent-subtle']};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${root['--color-border-strong']}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
</div>`;
}

/** Clock circle — reminder (accepts urgency colours) */
export function badgeReminder(bgColor: string, iconColor: string): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${bgColor};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
</div>`;
}

/** Bell circle — admin new booking */
export function badgeNewBooking(): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${root['--color-accent-subtle']};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${root['--color-border-strong']}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
</div>`;
}

/** Calendar-arrows circle — reschedule proposal */
export function badgeProposal(): string {
	return `<div style="width:64px;height:64px;border-radius:50%;background-color:${root['--color-accent-subtle']};margin:0 auto;display:flex;align-items:center;justify-content:center;">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${root['--color-border-strong']}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    <path d="M9 15l2 2 4-4"/>
  </svg>
</div>`;
}

// ---------------------------------------------------------------------------
// Meeting details card  (icon-row style, matching EventSidebar.svelte)
// ---------------------------------------------------------------------------

export interface MeetingDetailsOptions {
	eventName: string;
	hostName?: string;
	eventDescription?: string;
	formattedDate: string;
	formattedTime: string;
	meetingUrl?: string | null;
	meetingType?: 'google_meet' | 'teams';
	brandColor?: string;
}

export function generateMeetingDetailsCard(options: MeetingDetailsOptions): string {
	const {
		eventName,
		hostName,
		eventDescription,
		formattedDate,
		formattedTime,
		meetingUrl,
		meetingType = 'google_meet',
		brandColor = root['--color-primary']
	} = options;

	const meetingLabel = meetingType === 'teams' ? 'Microsoft Teams' : 'Google Meet';

	// SVG icons (matching the ones used in EventSidebar / [slug] page)
	const calendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;
	const clockIcon    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
	const videoIcon    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`;
	const personIcon   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

	const hostRow = hostName ? `
    <tr>
      <td style="padding:0 0 14px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;padding-right:12px;">${personIcon}</td>
          <td style="vertical-align:top;">
            <div style="color:${root['--color-subtle-foreground']};font-size:12px;margin-bottom:2px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Host</div>
            <div style="color:${root['--color-foreground']};font-size:15px;font-weight:600;">${hostName}</div>
          </td>
        </tr></table>
      </td>
    </tr>` : '';

	const descRow = eventDescription
		? `<div style="color:${root['--color-subtle-foreground']};font-size:13px;line-height:20px;margin-bottom:14px;">${eventDescription}</div>`
		: '';

	const meetingRow = meetingUrl ? `
    <tr>
      <td style="padding:0 0 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;padding-right:12px;">${videoIcon}</td>
          <td style="vertical-align:top;">
            <div style="color:${root['--color-subtle-foreground']};font-size:12px;margin-bottom:2px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Location</div>
            <a href="${meetingUrl}" style="color:${brandColor};font-size:15px;font-weight:600;text-decoration:none;">${meetingLabel}</a>
          </td>
        </tr></table>
      </td>
    </tr>` : `
    <tr>
      <td style="padding:0 0 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;padding-right:12px;">${videoIcon}</td>
          <td style="vertical-align:top;">
            <div style="color:${root['--color-subtle-foreground']};font-size:12px;margin-bottom:2px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Location</div>
            <div style="color:${root['--color-foreground']};font-size:15px;font-weight:600;">${meetingLabel}</div>
          </td>
        </tr></table>
      </td>
    </tr>`;

	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};border-radius:12px;margin-bottom:24px;">
  <tr>
    <td style="padding:20px 24px;">
      <!-- Event name -->
      <div style="font-size:17px;font-weight:700;color:${root['--color-foreground']};margin-bottom:16px;">${eventName}</div>
      ${descRow}
      <!-- Details rows -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${hostRow}
        <tr>
          <td style="padding:0 0 14px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${calendarIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${root['--color-subtle-foreground']};font-size:12px;margin-bottom:2px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Date</div>
                <div style="color:${root['--color-foreground']};font-size:15px;font-weight:600;">${formattedDate}</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 14px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${clockIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${root['--color-subtle-foreground']};font-size:12px;margin-bottom:2px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Time</div>
                <div style="color:${root['--color-foreground']};font-size:15px;font-weight:600;">${formattedTime}</div>
              </td>
            </tr></table>
          </td>
        </tr>
        ${meetingRow}
      </table>
    </td>
  </tr>
</table>`.trim();
}

// ---------------------------------------------------------------------------
// Message / notes card
// ---------------------------------------------------------------------------

export function generateAttendeeNotesCard(attendeeName: string, notes: string): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-border-strong']};margin-bottom:24px;">
  <tr>
    <td style="padding:14px 18px;">
      <div style="color:${root['--color-border-strong']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Message from ${attendeeName}</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${notes}</div>
    </td>
  </tr>
</table>`.trim();
}

export function generateYourMessageCard(notes: string): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-border-strong']};margin-bottom:24px;">
  <tr>
    <td style="padding:14px 18px;">
      <div style="color:${root['--color-border-strong']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Your message</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${notes}</div>
    </td>
  </tr>
</table>`.trim();
}

// ---------------------------------------------------------------------------
// CTA button  (pill shape, matching the "Schedule Event" / "Next" buttons)
// ---------------------------------------------------------------------------

export function generateActionButton(
	url: string,
	text: string,
	brandColor: string = root['--color-primary']
): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td align="center">
      <a href="${url}" style="display:inline-block;padding:14px 36px;background-color:${brandColor};color:${root['--color-primary-foreground']};text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;letter-spacing:0.01em;">${text}</a>
    </td>
  </tr>
</table>`.trim();
}

// ---------------------------------------------------------------------------
// Management links (reschedule / cancel)
// ---------------------------------------------------------------------------

export function generateManagementLinks(
	rescheduleUrl: string,
	cancelUrl: string,
	brandColor: string = root['--color-accent']
): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
  <tr>
    <td align="center">
      <a href="${rescheduleUrl}" style="color:${brandColor};text-decoration:none;font-size:13px;font-weight:500;">Reschedule</a>
      <span style="color:${root['--color-border-medium']};margin:0 10px;">|</span>
      <a href="${cancelUrl}" style="color:#dc2626;text-decoration:none;font-size:13px;font-weight:500;">Cancel</a>
    </td>
  </tr>
</table>`.trim();
}

// ---------------------------------------------------------------------------
// Time comparison block (old vs new time, for reschedule emails)
// ---------------------------------------------------------------------------

export function generateTimeComparison(
	oldLabel: string,
	oldTime: string,
	newLabel: string,
	newTime: string
): string {
	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <!-- Old time — neutral bg, subtle label, subtle strikethrough value (no red) -->
    <td width="46%" style="vertical-align:top;">
      <div style="background-color:${root['--color-surface-2']};border-radius:10px;padding:16px;">
        <div style="color:${root['--color-subtle-foreground']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${oldLabel}</div>
        <div style="color:${root['--color-subtle-foreground']};font-size:14px;font-weight:500;text-decoration:line-through;line-height:20px;">${oldTime}</div>
      </div>
    </td>
    <!-- Arrow -->
    <td width="8%" align="center" style="vertical-align:middle;">
      <span style="color:${root['--color-subtle-foreground']};font-size:18px;">→</span>
    </td>
    <!-- New time — accent-subtle bg, green label, foreground value (most important info) -->
    <td width="46%" style="vertical-align:top;">
      <div style="background-color:${root['--color-accent-subtle']};border-radius:10px;padding:16px;">
        <div style="color:${root['--color-border-strong']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${newLabel}</div>
        <div style="color:${root['--color-foreground']};font-size:14px;font-weight:600;line-height:20px;">${newTime}</div>
      </div>
    </td>
  </tr>
</table>`.trim();
}
