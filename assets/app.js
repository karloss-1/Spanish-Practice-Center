import { findStudent } from './student-routing.mjs';
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
    submit.disabled = true;
    message.textContent = 'Finding your learning space…';
    try {
      const response = await fetch('./data/students.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unavailable');
      const students = await response.json();
      if (!Array.isArray(students)) throw new Error('Invalid data');
      const url = findStudent(students, input.value);
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
