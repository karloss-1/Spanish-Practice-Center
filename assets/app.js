import { validNotionUrl } from './student-routing.mjs';
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobile = matchMedia('(max-width: 640px)');
function updateMenu() {
  menu.hidden = !mobile.matches;
  menu.setAttribute('aria-expanded', 'false');
  navigation.hidden = mobile.matches;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.hidden = !open;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && !navigation.hidden) {
    updateMenu();
    menu.focus();
  }
});
mobile.addEventListener('change', updateMenu);
updateMenu();
if (document.body.classList.contains('home')) {
  fetch('/api/auth/status', { credentials: 'same-origin', cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(result => { if (result?.authenticated) document.body.classList.add('student-authenticated'); })
    .catch(() => {});
}
if (!document.body.classList.contains('home')) {
  const authStyles = document.createElement('link');
  authStyles.rel = 'stylesheet';
  authStyles.href = '/assets/auth.css';
  document.head.append(authStyles);
  const logout = document.createElement('form');
  logout.className = 'logout-form';
  logout.action = '/student-access/logout';
  logout.method = 'post';
  logout.innerHTML = '<button type="submit">Log out</button>';
  navigation.append(logout);
  logout.addEventListener('submit', () => logout.querySelector('button').disabled = true);
}
const form = document.querySelector('#student-form');
if (form) {
  const input = document.querySelector('#first-name');
  const message = document.querySelector('#lookup-message');
  const submit = form.querySelector('button');
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    message.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    if (!input.value.trim()) {
      message.textContent = 'Please enter your first name.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    submit.disabled = true;
    message.textContent = 'Finding your learning space…';
    try {
      const response = await fetch('./api/student-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.value }),
        cache: 'no-store',
        credentials: 'same-origin',
        signal: AbortSignal.timeout(15000)
      });
      if (response.status === 409) {
        message.textContent = 'Please enter your first name and last initial. Ask Azael if you’re unsure which name to use.';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      if (!response.ok && response.status !== 404) throw new Error('Unavailable');
      const result = await response.json();
      const url = response.ok ? validNotionUrl(result.url) : null;
      if (response.ok && !url) throw new Error('Invalid response');
      if (url) {
        message.textContent = 'Opening your learning space…';
        window.location.assign(url);
      } else {
        message.textContent = "We couldn't find that name. Check the spelling and try again.";
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    } catch {
      message.textContent = 'We couldn’t open your learning space right now. Please try again in a moment.';
    } finally {
      submit.disabled = false;
    }
  });
}
