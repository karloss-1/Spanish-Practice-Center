import { questions, categories } from './ser-estar-content.mjs';
import { createAttempt, checkAnswer, recordAnswer, resultsFor } from './grammar-practice.mjs';
const localQuestions = questions.filter(question => !question.id.startsWith('P'));
const practiceQuestions = questions.filter(question => question.id.startsWith('P'));
const completedLocal = new Set();
let attempt = createAttempt(practiceQuestions);
const byId = id => document.getElementById(id);
const start = byId('practice-start');
const resume = byId('practice-continue');
const next = byId('practice-next');
const showResults = byId('practice-results');
const holder = byId('practice-question');
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function practiceForm(question) {
  const form = element('form', '', 'grammar-check');
  form.dataset.question = question.id;
  const indicator = element('p', `Question ${attempt.currentIndex + 1} of ${practiceQuestions.length}`, 'eyebrow');
  indicator.id = 'practice-indicator'; indicator.tabIndex = -1;
  form.append(indicator);
  const fieldset = element('fieldset');
  fieldset.append(element('legend', question.prompt));
  if (question.sentence) {
    const sentence = element('p', question.sentence, 'grammar-sentence'); sentence.lang = 'es'; fieldset.append(sentence);
  }
  const options = element('div', '', 'grammar-options');
  for (const option of question.options) {
    const label = element('label', '', 'grammar-option');
    const input = element('input'); input.type = 'radio'; input.name = question.id; input.value = option;
    label.append(input, element('span', option)); options.append(label);
  }
  fieldset.append(options); form.append(fieldset);
  const actions = element('div', '', 'grammar-actions');
  const check = element('button', 'Check answer', 'grammar-button primary'); check.type = 'submit';
  const retry = element('button', 'Try this question again', 'grammar-button retry'); retry.type = 'button'; retry.hidden = true;
  actions.append(check, retry); form.append(actions);
  const feedback = element('div', '', 'grammar-feedback');
  feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite'); feedback.setAttribute('aria-atomic', 'true');
  form.append(feedback); bindCheck(form, question, true); return form;
}
function bindCheck(form, question, practice = false) {
  const fieldset = form.querySelector('fieldset');
  const feedback = form.querySelector('.grammar-feedback');
  const check = form.querySelector('[type="submit"]');
  const retry = form.querySelector('.retry');
  function showFeedback(result) {
    feedback.replaceChildren(element('strong', result.correct ? 'Correct' : 'Not quite'), element('p', result.feedback));
    feedback.dataset.state = result.correct ? 'correct' : 'incorrect';
    fieldset.disabled = true; check.hidden = true; retry.hidden = result.correct;
    // Move focus away from a control that just became hidden.
    feedback.tabIndex = -1; feedback.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector('input:checked')?.value;
    const result = practice ? recordAnswer(attempt, question.id, selected) : checkAnswer(question, selected);
    if (!result) {
      feedback.textContent = 'Choose an answer before checking.';
      delete feedback.dataset.state;
      form.querySelector('input').focus(); return;
    }
    showFeedback(result);
    if (practice) {
      updateProgress();
      next.hidden = attempt.currentIndex === practiceQuestions.length - 1;
      showResults.hidden = false;
    } else {
      completedLocal.add(question.id);
      byId('local-progress').textContent = `Checks completed: ${completedLocal.size} of ${localQuestions.length}`;
    }
  });
  retry.addEventListener('click', () => {
    fieldset.disabled = false;
    for (const input of form.querySelectorAll('input')) input.checked = false;
    feedback.replaceChildren(); delete feedback.dataset.state;
    check.hidden = false; retry.hidden = true;
    if (practice) { next.hidden = true; showResults.hidden = true; }
    form.querySelector('input').focus();
  });
  // Restoring a question always uses its first checked answer.
  if (practice && attempt.firstAnswers.has(question.id)) {
    const result = attempt.firstAnswers.get(question.id);
    for (const input of form.querySelectorAll('input')) input.checked = input.value === result.selected;
    showFeedback(result);
  }
}
for (const question of localQuestions) bindCheck(document.querySelector(`[data-question="${question.id}"]`), question);
function updateProgress() {
  const message = `You have answered ${attempt.firstAnswers.size} of 11 questions. Complete the remaining questions to see your result.`;
  byId('practice-progress').textContent = message;
  if (!resultsFor(attempt, categories).complete) byId('result-score').textContent = message;
}
function renderCurrent() {
  holder.replaceChildren(practiceForm(practiceQuestions[attempt.currentIndex]));
  next.hidden = !attempt.firstAnswers.has(practiceQuestions[attempt.currentIndex].id) || attempt.currentIndex === practiceQuestions.length - 1;
  showResults.hidden = attempt.firstAnswers.size === 0;
  byId('practice-indicator').focus();
}
start.addEventListener('click', () => {
  attempt.started = true; start.hidden = true; resume.hidden = false;
  updateProgress(); renderCurrent();
});
resume.addEventListener('click', () => {
  const firstUnanswered = practiceQuestions.findIndex(question => !attempt.firstAnswers.has(question.id));
  if (firstUnanswered !== -1) attempt.currentIndex = firstUnanswered;
  renderCurrent();
});
next.addEventListener('click', () => {
  if (!attempt.firstAnswers.has(practiceQuestions[attempt.currentIndex].id)) return;
  if (attempt.currentIndex < practiceQuestions.length - 1) attempt.currentIndex += 1;
  renderCurrent();
});
function renderReviews(difficultOnly) {
  const reviewHolder = byId('question-reviews'); reviewHolder.replaceChildren();
  const shown = difficultOnly ? resultsFor(attempt, categories).missed : practiceQuestions;
  byId('review-empty').hidden = shown.length !== 0;
  byId('review-all').hidden = !difficultOnly;
  for (const question of shown) {
    const answer = attempt.firstAnswers.get(question.id);
    const details = element('details', '', 'grammar-review'); details.dataset.review = question.id;
    const number = practiceQuestions.indexOf(question) + 1;
    details.append(element('summary', `Question ${number}`));
    details.append(element('p', question.prompt));
    if (question.sentence) { const sentence = element('p', question.sentence); sentence.lang = 'es'; details.append(sentence); }
    details.append(element('p', `Your first answer: ${answer.selected}`), element('p', `Correct answer: ${question.correct}`), element('p', answer.feedback));
    const link = element('a', 'Review this section'); link.href = `#${question.anchor}`; details.append(link); reviewHolder.append(details);
  }
}
showResults.addEventListener('click', () => {
  const result = resultsFor(attempt, categories);
  if (result.complete) {
    byId('result-score').textContent = `You got ${result.correct} of 11 correct on your first checked answers.`;
    byId('result-detail').hidden = false;
    byId('result-categories').replaceChildren(...result.categories.map(category => {
      const item = element('p'); item.append(element('strong', category.label), element('span', `${category.correct} of ${category.total}`)); return item;
    }));
    byId('result-guidance').textContent = result.correct === 11
      ? 'You answered every question correctly on your first checked answers. You can explore the Quick Reference or try the practice again.'
      : 'Review the feedback for the questions you missed. Focus on the meaning you wanted to express.';
    renderReviews(false);
  } else updateProgress();
  byId('results-title').focus();
});
byId('review-difficult').addEventListener('click', () => renderReviews(true));
byId('review-all').addEventListener('click', () => renderReviews(false));
byId('practice-reset').addEventListener('click', () => {
  attempt = createAttempt(practiceQuestions);
  holder.replaceChildren(); next.hidden = showResults.hidden = resume.hidden = true; start.hidden = false;
  byId('result-detail').hidden = true; updateProgress();
  byId('practice-progress').textContent = 'New attempt started.'; start.focus();
});
// The section navigation scrolls naturally, and never locks content behind practice.
const sectionLinks = document.querySelectorAll('.grammar-nav a');
function markSection() {
  const hash = window.location.hash || '#hero';
  for (const link of sectionLinks) {
    if (link.getAttribute('href') === hash || (hash === '#overview' && link.getAttribute('href') === '#hero')) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', markSection); markSection();
