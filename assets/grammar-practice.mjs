// Small state model shared by grammar lessons; no persistence or backend.
export function createAttempt(questions) {
  return { questions, firstAnswers: new Map(), currentIndex: 0, started: false };
}
export function checkAnswer(question, selected) {
  if (!question.options.includes(selected)) return null;
  const correct = selected === question.correct;
  return { selected, correct, feedback: correct ? question.correctFeedback : question.incorrectFeedback[selected] };
}
export function recordAnswer(attempt, id, selected) {
  const question = attempt.questions.find(item => item.id === id);
  if (!question) return null;
  const result = checkAnswer(question, selected);
  if (result && !attempt.firstAnswers.has(id)) attempt.firstAnswers.set(id, result);
  return result;
}
export function resultsFor(attempt, categories) {
  const answered = attempt.firstAnswers.size;
  return {
    answered, total: attempt.questions.length, complete: answered === attempt.questions.length,
    correct: [...attempt.firstAnswers.values()].filter(answer => answer.correct).length,
    categories: categories.map(category => ({ ...category, total: category.ids.length,
      correct: category.ids.filter(id => attempt.firstAnswers.get(id)?.correct).length })),
    missed: attempt.questions.filter(question => attempt.firstAnswers.has(question.id) && !attempt.firstAnswers.get(question.id).correct)
  };
}
