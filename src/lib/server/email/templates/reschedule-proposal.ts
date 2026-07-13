/**
 * Reschedule proposal email template (host proposes a new time to attendee).
 *
 * Fully rich-text / host-editable: the entire email body is either the
 * host's custom rich-text message (sanitized, with {variables} substituted)
 * or a plain default body if the host hasn't customized it yet.
 *
 */

import type { RescheduleProposalEmailData } from '../types';
import { sanitizeEmailHtml } from '../sanitize';
import { applyEmailVariables, buildRescheduleProposalVariables } from '../template-variables';

const DEFAULT_PROPOSAL_BODY = `<p>Hi {attendee_name},</p>
<p>I would like to reschedule our meeting to a new time.</p>
{proposal_message}
<p><strong>Original time:</strong><br>
{old_date}<br>
{old_time}</p>
<p><strong>Proposed time:</strong><br>
{proposed_date}<br>
{proposed_time}</p>
<p>
  <a href="{accept_url}">Accept New Time</a> |
  <a href="{decline_url}">Decline</a> |
  <a href="{counter_url}">Propose a different time</a>
</p>`.trim();

/**
 * Generate HTML email for a host-initiated reschedule proposal.
 *
 * @param data        Proposal data (times, URLs, optional host message)
 * @param customBody  Optional host-saved rich-text body from the dashboard.
 *                    When present it is sanitized and has {variables} replaced.
 *                    When absent the static default body is used instead.
 */
export function generateRescheduleProposalEmail(
	data: RescheduleProposalEmailData,
	customBody?: string | null
): string {
	const vars = buildRescheduleProposalVariables(data);

	const body = customBody && customBody.trim().length > 0
		? sanitizeEmailHtml(customBody)
		: DEFAULT_PROPOSAL_BODY;

	return applyEmailVariables(body, vars);
}
