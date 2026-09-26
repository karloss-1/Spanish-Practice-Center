function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function loginPage(returnTo, { error = false, unavailable = false, rejected = false, malformed = false } = {}) {
  const message = rejected ? 'This sign-in request was rejected (403). Please reopen the student page and try again.' : malformed ? 'The sign-in form could not be read. Please reload this page and try again.' : unavailable ? 'Student Access is temporarily unavailable. Please try again later.' : error ? 'That password wasn’t correct. Please try again.' : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Student Access · Spanish Practice Center</title><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/auth.css"></head>
<body class="auth-page"><a class="skip" href="#main">Skip to content</a><header><div class="header-inner"><a class="brand" href="/"><strong>Spanish Practice Center</strong><span>by Azael</span></a></div></header>
<main id="main" class="auth-main"><section class="auth-card" aria-labelledby="auth-title"><p class="eyebrow">STUDENT AREA</p><h1 id="auth-title">Student Access</h1><p class="lede">This area is available to current students.</p>
<form method="post" action="/student-access"><input type="hidden" name="returnTo" value="${escapeAttribute(returnTo)}"><label for="student-password">Password</label><div class="password-field"><input id="student-password" name="password" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required maxlength="256" ${error ? 'aria-invalid="true"' : ''}><button class="password-toggle" type="button" aria-label="Show password" aria-controls="student-password"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/></svg></button></div><button class="button" type="submit">Continue</button>${message ? `<p class="auth-message" role="alert">${message}</p>` : ''}</form>
<a class="auth-back" href="/">← Back to Home</a></section></main><footer><span>Spanish Practice Center · Created by Azael · © 2026</span></footer><script>const passwordInput = document.getElementById('student-password'); const passwordToggle = document.querySelector('.password-toggle'); passwordToggle.addEventListener('click', () => { const visible = passwordInput.type === 'password'; passwordInput.type = visible ? 'text' : 'password'; passwordToggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password'); });</script></body></html>`;
}

export function htmlResponse(body, status = 200, extraHeaders = {}) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'same-origin', ...extraHeaders } });
}
