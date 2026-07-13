/**
 * Lightweight, dependency-free HTML sanitizer + plain-text converter for
 * user-authored email bodies (produced by SimpleWysiwyg.svelte).
 *
 * This runs in the Cloudflare Workers/Pages edge runtime, so it cannot rely
 * on jsdom-based libraries like isomorphic-dompurify (those are only used
 * client-side elsewhere in this codebase). Instead we do a conservative
 * regex/allowlist-based pass that is safe for the very small set of tags the
 * WYSIWYG editor can actually produce.
 *
 * IMPORTANT: Sanitize the raw editor HTML *before* substituting {variables},
 * so that variable placeholders can safely appear inside href="..." values
 * (e.g. href="{cancel_url}") and survive sanitization untouched.
 */

// Tags the WYSIWYG editor can produce (bold/italic/underline/lists/links + basic containers)
const ALLOWED_TAGS = new Set([
	'a', 'b', 'strong', 'i', 'em', 'u',
	'p', 'div', 'br',
	'ul', 'ol', 'li',
	'span', 'blockquote'
]);

// Only <a> keeps an attribute (href); everything else is stripped of all attributes.
const ALLOWED_ATTRS: Record<string, string[]> = {
	a: ['href']
};

/** Matches a raw {variable_name} placeholder token */
const VARIABLE_TOKEN = /^\{[a-zA-Z_]+\}$/;

function isSafeHref(href: string): boolean {
	const trimmed = href.trim();
	if (VARIABLE_TOKEN.test(trimmed)) return true;
	if (/^https?:\/\//i.test(trimmed)) return true;
	if (/^mailto:/i.test(trimmed)) return true;
	return false;
}

/**
 * Sanitize user-authored rich text HTML down to a safe allowlisted subset.
 * Strips <script>/<style> contents entirely, removes disallowed tags (but
 * keeps their text content), strips all attributes except a validated
 * href on <a>, and forces safe link behavior (target=_blank, rel=noopener).
 */
export function sanitizeEmailHtml(html: string): string {
	if (!html) return '';

	let out = html;

	// Remove script/style elements and their contents completely
	out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
	out = out.replace(/<style[\s\S]*?<\/style>/gi, '');

	// Remove HTML comments
	out = out.replace(/<!--[\s\S]*?-->/g, '');

	// Process all tags (opening and self-closing/closing)
	out = out.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
		const tag = rawTag.toLowerCase();
		const isClosing = match.startsWith('</');

		if (!ALLOWED_TAGS.has(tag)) {
			// Drop disallowed tags entirely (their text content remains in the surrounding text)
			return '';
		}

		if (isClosing) {
			return `</${tag}>`;
		}

		// Self-closing void element
		if (tag === 'br') {
			return '<br>';
		}

		// Rebuild only allowed attributes for this tag
		const allowedForTag = ALLOWED_ATTRS[tag] || [];
		if (allowedForTag.length === 0) {
			return `<${tag}>`;
		}

		let attrsOut = '';
		if (tag === 'a') {
			const hrefMatch = rawAttrs.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
			const hrefValue = hrefMatch ? (hrefMatch[2] ?? hrefMatch[3] ?? '') : null;
			if (hrefValue && isSafeHref(hrefValue)) {
				const escapedHref = hrefValue.replace(/"/g, '&quot;');
				attrsOut = ` href="${escapedHref}" target="_blank" rel="noopener noreferrer"`;
			}
		}

		return `<${tag}${attrsOut}>`;
	});

	return out.trim();
}

/**
 * Convert sanitized email HTML into a readable plain-text fallback.
 * Assumes input has already passed through sanitizeEmailHtml (and variable
 * substitution), so only the small allowlisted tag set needs handling.
 */
export function htmlToPlainText(html: string): string {
	if (!html) return '';

	let text = html;

	// Links: "text (url)" — skip if url is identical to the visible text
	text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_match, href: string, inner: string) => {
		const label = inner.replace(/<[^>]+>/g, '').trim();
		if (!label) return href;
		if (label === href) return label;
		return `${label} (${href})`;
	});

	// List items -> "- item"
	text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, inner: string) => `- ${inner}\n`);

	// Block-level elements -> newline after
	text = text.replace(/<\/(p|div|blockquote|ul|ol)>/gi, '\n');
	text = text.replace(/<br\s*\/?>/gi, '\n');

	// Strip any remaining allowed inline tags (b, strong, i, em, u, span)
	text = text.replace(/<[^>]+>/g, '');

	// Decode common HTML entities
	text = text
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

	// Collapse excessive blank lines and trim trailing whitespace per line
	text = text
		.split('\n')
		.map((line) => line.trim())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	return text;
}
