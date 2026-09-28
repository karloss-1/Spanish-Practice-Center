const contentBase = 'assets/readings/';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const readingUrl = slug => `reading.html?slug=${encodeURIComponent(slug)}`;
async function getJSON(file) {
  const response = await fetch(contentBase + file, {credentials:'same-origin'});
  if (response.status === 401) { window.location.assign(`/student-access?returnTo=${encodeURIComponent(location.pathname + location.search)}`); throw new Error('Please sign in to continue.'); }
  if (!response.ok) throw new Error('The reading could not be loaded. Please try again.');
  return response.json();
}
function showError(target, message) {
  target.innerHTML = `<div class="read-error" role="alert"><h2>Unable to open this reading</h2><p>${escape(message)}</p><a href="read.html">Back to all readings</a></div>`;
  target.removeAttribute('aria-busy');
}
async function library() {
  const grid = document.querySelector('#reading-grid');
  try {
    const readings = await getJSON('index.json');
    const filter = level => {
      const selected = level === 'All' ? readings : readings.filter(r => r.level === level);
      document.querySelectorAll('[data-level]').forEach(button => { if(button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.level === level)); });
      document.querySelector('#readings-title').textContent = level === 'All' ? 'All readings' : `${level} readings`;
      document.querySelector('#reading-count').textContent = `${selected.length} ${selected.length === 1 ? 'reading' : 'readings'}`;
      grid.innerHTML = selected.length ? selected.map(r => `<a class="reading-card" data-level="${escape(r.level)}" href="${readingUrl(r.slug)}"><img src="${escape(r.thumbnail)}" width="720" height="405" alt="${escape(r.imageAlt)}" loading="lazy"><div class="reading-card-copy"><span class="read-meta">${escape(r.level)} · ${escape(r.readingTime)}</span><h3 lang="es">${escape(r.title)}</h3><p lang="es">${escape(r.description)}</p><div class="card-bottom"><span class="read-category" lang="es">${escape(r.category)}</span><span class="card-arrow" aria-hidden="true">→</span></div></div></a>`).join('') : '<p class="read-empty">New readings at this level are coming soon. Explore another level in the meantime.</p>';
    };
    document.querySelectorAll('.read-filters button').forEach(button => button.addEventListener('click', () => filter(button.dataset.level)));
    filter('All');
  } catch(error) { document.querySelector('#reading-count').textContent = ''; showError(grid,error.message); }
}
function quiz(root, questions) {
  let current = 0, answers = [], selected = null, order = [], checked = false;
  const answerText = (q, value) => Array.isArray(value) ? value.map(i => `${String.fromCharCode(65+i)}. ${q.options[i]}`).join(' → ') : `${q.options.length === 2 ? '' : String.fromCharCode(65+value)+'. '}${q.options[value]}`;
  const correct = (q,value) => JSON.stringify(value) === JSON.stringify(q.answer);
  const focusHeading = () => root.querySelector('[tabindex="-1"]')?.focus();
  function question(moveFocus = false) {
    const q = questions[current]; selected = null; order = q.options.map((_,i)=>i); checked = false;
    root.innerHTML = `<form class="quiz-form"><div class="quiz-progress"><span>Question ${current+1} of ${questions.length}</span><progress value="${current+1}" max="${questions.length}" aria-label="Question progress"></progress></div><fieldset><legend tabindex="-1" lang="es">${current+1}. ${escape(q.question)}</legend><div class="quiz-choices"></div></fieldset><button class="button check-answer" type="submit" ${q.type === 'order' ? '' : 'disabled'}>Check answer</button></form><div class="quiz-feedback" aria-live="polite"><p>${q.type === 'order' ? 'Use the arrows to put the actions in order, then check your answer.' : 'Select an answer and check it.'}</p></div>`;
    renderChoices(q);
    root.querySelector('form').addEventListener('submit', event => {
      event.preventDefault(); if(checked || (q.type !== 'order' && selected === null)) return;
      checked = true; const value = q.type === 'order' ? [...order] : selected;
      answers.push(value); const isCorrect = correct(q,value);
      root.querySelectorAll('input, .order-controls button, .check-answer').forEach(control => control.disabled = true);
      root.querySelectorAll('.quiz-option').forEach((label,i) => {
        if(i === q.answer || i === value) {
          label.classList.add(i === q.answer ? 'is-correct' : 'is-incorrect');
          const state = document.createElement('span'); state.className = 'option-state'; state.textContent = i === q.answer ? '✓' : '✕'; state.setAttribute('aria-label',i === q.answer ? 'Correct answer' : 'Your answer, incorrect'); label.append(state);
        }
      });
      const feedback = root.querySelector('.quiz-feedback'); feedback.classList.add(isCorrect ? 'correct':'incorrect');
      feedback.innerHTML = `<h3>${isCorrect ? '✓ Correct' : 'Not quite.'}</h3>${isCorrect ? '' : `<p>The correct answer is <span lang="es">${escape(answerText(q,q.answer))}</span></p>`}<button class="button next-question" type="button">${current+1 === questions.length ? 'See results' : 'Next question →'}</button>`;
      feedback.querySelector('button').addEventListener('click',() => { current++; current < questions.length ? question(true) : results(); });
    });
    if(moveFocus) focusHeading();
  }
  function renderChoices(q, focusIndex) {
    const choices = root.querySelector('.quiz-choices');
    if(q.type === 'order') {
      choices.innerHTML = `<ol class="order-list">${order.map((id,pos)=>`<li><span lang="es">${String.fromCharCode(65+id)}. ${escape(q.options[id])}</span><div class="order-controls"><button type="button" data-position="${pos}" data-delta="-1" aria-label="Move ${String.fromCharCode(65+id)} up" ${pos===0?'disabled':''}>↑</button><button type="button" data-position="${pos}" data-delta="1" aria-label="Move ${String.fromCharCode(65+id)} down" ${pos===order.length-1?'disabled':''}>↓</button></div></li>`).join('')}</ol><span class="sr-only order-status" role="status"></span>`;
      choices.querySelectorAll('button').forEach(button => button.addEventListener('click',()=> {
        const pos=Number(button.dataset.position), next=pos+Number(button.dataset.delta);
        [order[pos],order[next]]=[order[next],order[pos]];renderChoices(q,next);
        choices.querySelector('.order-status').textContent = `Current order: ${order.map(i=>String.fromCharCode(65+i)).join(', ')}`;
      }));
      if(focusIndex !== undefined) choices.querySelectorAll('li')[focusIndex].querySelector('button:not(:disabled)').focus();
    } else {
      choices.innerHTML=q.options.map((option,i)=>`<label class="quiz-option"><input type="radio" name="answer" value="${i}"><span lang="es">${q.options.length===2?'':String.fromCharCode(65+i)+'. '}${escape(option)}</span></label>`).join('');
      choices.addEventListener('change',event=>{selected=Number(event.target.value);root.querySelector('.check-answer').disabled=false;});
    }
  }
  function results() {
    const score=questions.filter((q,i)=>correct(q,answers[i])).length;
    root.innerHTML=`<div class="quiz-result"><h3 tabindex="-1">${score} of ${questions.length} correct</h3><button class="button" type="button" id="retry-quiz">Try again</button><button class="read-secondary" type="button" id="review-quiz" aria-expanded="false" aria-controls="answer-review">Review answers</button><ol id="answer-review" class="answer-review" hidden>${questions.map((q,i)=>`<li><strong lang="es">${escape(q.question)}</strong><p>${correct(q,answers[i])?'✓ Correct':'Not quite.'}</p><p>Your answer: <span lang="es">${escape(answerText(q,answers[i]))}</span></p><p>Correct answer: <span lang="es">${escape(answerText(q,q.answer))}</span></p></li>`).join('')}</ol></div>`;
    root.querySelector('#retry-quiz').addEventListener('click',()=>{current=0;answers=[];question(true);});
    root.querySelector('#review-quiz').addEventListener('click',event=>{const list=root.querySelector('#answer-review');list.hidden=!list.hidden;event.target.setAttribute('aria-expanded',String(!list.hidden));event.target.textContent=list.hidden?'Review answers':'Hide answers';});
    focusHeading();
  }
  question();
}
async function reading() {
  const target=document.querySelector('#reading-content');
  try {
    const slug=new URLSearchParams(location.search).get('slug');
    const index=await getJSON('index.json');const position=index.findIndex(r=>r.slug===slug);
    if(position<0) throw new Error('This reading is not in the collection. Choose a reading from the library.');
    const r=await getJSON(`${slug}.json`);
    document.title=`${r.title} · Spanish Practice Center`;
    const neighbor=(n,type)=>n ? `<a class="${type}" href="${readingUrl(n.slug)}">${type==='previous'?'← Previous':'Next →'}<strong lang="es">${escape(n.title)}</strong></a>`:'';
    target.innerHTML=`<article><div class="article-top"><div class="read-meta"><span>${escape(r.level)}</span><span lang="es">${escape(r.category)}</span><span>${escape(r.readingTime)}</span></div><h1 lang="es">${escape(r.title)}</h1><p class="article-description" lang="es">${escape(r.description)}</p><img class="reading-image" src="${escape(r.image)}" width="1672" height="941" alt="${escape(r.imageAlt)}" fetchpriority="high"><div class="reading-tools"><div class="audio-player"><audio controls preload="metadata" aria-label="Listen to ${escape(r.title)}"><source src="${escape(r.audio.src)}" type="${escape(r.audio.type)}">Your browser does not support audio.</audio><label class="sr-only" for="audio-speed">Playback speed</label><select id="audio-speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></div><button type="button" class="translation-toggle" aria-expanded="false" aria-controls="article-body">Show English translation</button></div><p class="audio-note" id="audio-status">Audio · Spanish (Mexico) · synthesized voice</p></div><div class="article-body" id="article-body">${r.paragraphs.map(p=>`<p lang="es">${escape(p.es)}</p><p class="translation" lang="en" hidden>${escape(p.en)}</p>`).join('')}</div><section class="learning-section" aria-labelledby="vocabulary-title"><div class="section-heading"><h2 id="vocabulary-title">Key vocabulary</h2></div><dl class="vocabulary-list">${r.vocabulary.map(v=>`<div class="vocabulary-row"><dt lang="es">${escape(v.word)}</dt><dd><p lang="es">${escape(v.definition)}</p><p class="vocab-english" lang="en">${escape(v.english)}</p>${v.usage?`<p class="vocab-usage" lang="es">${escape(v.usage)}</p>`:''}</dd></div>`).join('')}</dl></section><section class="learning-section" aria-labelledby="quiz-title"><div class="section-heading"><h2 id="quiz-title">Check your understanding</h2><span>${r.questions.length} questions</span></div><div class="quiz-panel" id="quiz"></div></section><section class="learning-section" aria-labelledby="discuss-title"><div class="section-heading"><h2 id="discuss-title">Think &amp; discuss</h2><span>${r.discussion.length} questions</span></div><ol class="discussion-list" lang="es">${r.discussion.map(p=>`<li>${escape(p)}</li>`).join('')}</ol></section><nav class="reading-pagination" aria-label="Reading navigation">${neighbor(index[position-1],'previous')}${neighbor(index[position+1],'next')}</nav></article>`;
    target.removeAttribute('aria-busy');
    const toggle=target.querySelector('.translation-toggle');
    toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Hide English translation':'Show English translation';target.querySelectorAll('.translation').forEach(p=>p.hidden=!open);});
    const audio=target.querySelector('audio');
    target.querySelector('#audio-speed').addEventListener('change',event=>audio.playbackRate=Number(event.target.value));
    audio.addEventListener('error',()=>{target.querySelector('#audio-status').textContent='Audio is unavailable right now. Please reload to try again.';});
    audio.querySelector('source').addEventListener('error',()=>{target.querySelector('#audio-status').textContent='Audio is unavailable right now. Please reload to try again.';});
    window.addEventListener('pagehide',()=>audio.pause());
    quiz(target.querySelector('#quiz'),r.questions);
  } catch(error) { showError(target,error.message); }
}
if(document.querySelector('#reading-grid')) library();
if(document.querySelector('#reading-content')) reading();
