/* ═══════════════════════════════════════════════════════
   THE TALENT SHOW — Review · script.js
   Built on the World Without Rules Review (pick a section, 2 attempts,
   right/wrong feedback) with the World Without Rules Test v2 two-sided
   Comprehension screen: the story pages sit on the left and open to the
   page each question names.
   Timers: 20s instructions lock · 12s read lock · 6s next soak
   Game keys: talent-review-vocab · talent-review-comp · talent-review-cloze
   PIN: 9377 (Teacher override)
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const REVIEW_OPEN   = true;    // false = students locked out; only Teacher Access works. Set true to open.
/* TEST DAY (Marcos 10/23: "On test day, [the review] page should be locked unless unlocked by
   teacher pin"). On these dates (New York time) the review is closed to students; the Teacher PIN
   opens it on THIS computer for the rest of the day. Keep the same list in the front door
   (class-portal/the-talent-show/index.html). */
const TEST_DAYS     = ['2026-10-23'];
const UNLOCK_KEY    = 'talent_review_unlock_v1';   // = today's date once the Teacher PIN opened it here
function todayNY() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
function isTestDayLocked() {
  if (SHARE_MODE || !TEST_DAYS.includes(todayNY())) return false;
  try { return localStorage.getItem(UNLOCK_KEY) !== todayNY(); } catch (e) { return true; }
}
const SHARE_MODE    = !!window.SHARE_MODE;   // set by share.js — a visitor's link, never a student's
const INSTRUCT_SECS = 20;
const READ_SECS     = 12;
const NEXT_SECS     = 6;
const STORAGE_KEY   = 'talent_review_session_v1';
const SCORES_KEY    = 'talent_review_scores_v1';
const TALENT_SESSION_ID_KEY = 'talent_session_id_v1';
const SESSION_ID = (() => {
  let id = localStorage.getItem(TALENT_SESSION_ID_KEY);
  if (!id) { id = 'TALENT-' + Math.random().toString(36).slice(2, 9).toUpperCase(); localStorage.setItem(TALENT_SESSION_ID_KEY, id); }
  return id;
})();

const GAME_KEYS = { vocab: 'talent-review-vocab', comp: 'talent-review-comp', cloze: 'talent-review-cloze' };

// Story pages in the Comprehension panel (the test's page numbers: the title page is page 2)
const STORY_PAGES = [34, 35, 36, 37];

/* ── SHEET SUBMISSION ───────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzv8CWv1yyi8NeH04now9UxVL4IZm5yMqqsEGMcgGdrcAOWVB-aSp5siTvSSJXIUpzFMA/exec';

let tabSwitchCount = 0;

/* Question HTML → plain text (Part II vocab underlines the word) */
function plainText(html) {
  return String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/* One saved miss: "[ID] (Skill) question (picked: answer)" — the standard every
   review uses. Skill comes from data/skills.js by question id, so misses restored
   from an older saved attempt still get tagged. " | " separates entries, so it is
   swapped out of the pick just in case. */
function missEntry(m) {
  const skill  = m.skill || (window.SKILLS || {})[m.id] || 'Unsorted';
  const picked = m.yourAnswer == null || m.yourAnswer === '' ? '' :
    ` (picked: ${String(m.yourAnswer).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim()})`;
  return `[${m.id}] (${skill}) ${plainText(m.q)}${picked}`;
}

// Same id for the partial rows and the final row of one attempt, so the
// final row replaces the in-progress row instead of sitting beside it.
// The base id is saved with the progress, so a resume after closing the tab keeps it too.
function attemptSessionId() {
  return (app.sessionBase || SESSION_ID) + '-' + (app.currentSection || 'x') + '-A' + (app.currentAttemptNum || 1);
}

function submitScorePartial() {
  const pct = app.currentBank.length
    ? Math.round((app.score / app.currentBank.length) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:         'submit',
      game:           GAME_KEYS[app.currentSection] || 'talent-review',
      sessionId:      attemptSessionId(),
      name:           app.studentName || 'Unknown',
      section:        app.currentSection || '?',
      score:          app.score,
      total:          app.currentBank.length,
      percent:        pct,
      status:         `In Progress (Q${app.currentIndex + 1}/${app.currentBank.length})`,
      done:           false,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      events:         JSON.stringify(app.events || []),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function submitScoreFinal() {
  const pct = app.currentBank.length
    ? Math.round((app.score / app.currentBank.length) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:         'submit',
      game:           GAME_KEYS[app.currentSection] || 'talent-review',
      sessionId:      attemptSessionId(),
      name:           app.studentName || 'Unknown',
      section:        app.currentSection || '?',
      attempt:        app.currentAttemptNum || 1,
      score:          app.score,
      total:          app.currentBank.length,
      percent:        pct,
      status:         'Complete',
      done:           true,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      events:         JSON.stringify(app.events || []),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

/* ── ROSTER ─────────────────────────────────────────── */
const ROSTER = [
  { name: "Mr. O (Teacher)",           id: "9377" },
  { name: "Avery, Jo'Von",             id: "10053632" },
  { name: "Belasquez Bonilla, Eduin",  id: "10058674" },
  { name: "Castaneda, Kelvin",         id: "10053248" },
  { name: "Chicas-Santos, Allison",    id: "10066737" },
  { name: "Collado, Roniel",           id: "10060249" },
  { name: "Dejesus, Michael",          id: "10049434" },
  { name: "Dock, Fakeem",              id: "10059720" },
  { name: "Douglas, Iyana",            id: "10070980" },
  { name: "Dumphrey, Christopher",     id: "10060696" },
  { name: "Flores, Kiara",             id: "10052834" },
  { name: "Johnson, Destiny",          id: "10052926" },
  { name: "Jones, Tahji",              id: "10060315" },
  { name: "Lawrence, Eric",            id: "10057451" },
  { name: "Madero, Jovany",            id: "10076374" },
  { name: "Pettway, Lanaura",          id: "10060616" },
  { name: "Polanco Soriano, Thiara",   id: "10060503" },
  { name: "Roberts, Robyn",            id: "10060925" },
  { name: "Rodriguez-Jimenez, Marcos", id: "10048936" },
  { name: "Rojas, Alanie",             id: "10076388" },
  { name: "Sanchez Rodriguez, Johanelyz", id: "10076767" },
  { name: "Vega, Taishmara",           id: "10054043" },
  { name: "Watts, Autumn",             id: "10039032" },
  { name: "Zelaya-Osorto, Nazareth",   id: "10053626" }
];

const GUEST_SLOTS = {
  '937701': 'Guest 1', '937702': 'Guest 2', '937703': 'Guest 3',
  '937704': 'Guest 4', '937705': 'Guest 5', '937706': 'Guest 6',
  '937707': 'Guest 7', '937708': 'Guest 8', '937709': 'Guest 9',
  '937710': 'Guest 10'
};

const SECTION_LABELS = { vocab: 'Vocabulary', comp: 'Comprehension', cloze: 'Cloze' };

function sectionBank(section) {
  return section === 'vocab' ? window.VOCAB_BANK : section === 'comp' ? window.COMP_BANK : window.CLOZE_BANK;
}

/* ── BUILD DROPDOWN ─────────────────────────────────── */
(function buildRoster() {
  const sel = document.getElementById('name-select');
  ROSTER.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name; o.textContent = s.name;
    sel.appendChild(o);
  });
  const div = document.createElement('option');
  div.disabled = true; div.textContent = '── Guest Slots ──';
  sel.appendChild(div);
  Object.entries(GUEST_SLOTS).forEach(([code, label]) => {
    const o = document.createElement('option');
    o.value = `GUEST:${code}`; o.textContent = `🙋 ${label}`;
    sel.appendChild(o);
  });
})();

/* ── STATE ──────────────────────────────────────────── */
let loggedInName     = '';
let unlockedSections = new Set();
let pinModalCallback = null;
let activeSpeakBtn   = null;
let reviewMode       = false;
let reviewAutoRun    = false;

function letterGradeStudent(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 63) return 'D';
  if (pct >= 60) return 'D-';
  return 'F';
}

let hlTimer = null;
const liveUtterances = new Set();   // speech in progress, held so its events still arrive
function stopActiveSpeech() {
  clearTimeout(hlTimer);
  window.speechSynthesis.cancel();
  document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
  if (activeSpeakBtn) { activeSpeakBtn.textContent = '🔊'; activeSpeakBtn = null; }
}

/* ── HIGHLIGHT FALLBACK ─────────────────────────────
   Some voices (and some browsers) never fire word-boundary
   events, so the highlight would never move. If no boundary
   arrives shortly after speaking starts, step through the
   words on a timer paced by word length and speech rate. */
function addHighlightFallback(u, spans) {
  let fired = false, i = 0, ended = false;
  const prevB = u.onboundary, prevE = u.onend;
  u.onboundary = e => { if (e.name === 'word' && !fired) { fired = true; clearTimeout(hlTimer); } if (prevB) prevB(e); };
  // The end of the speech always stops the highlight, however the voice reports it:
  // a normal end, an error or cancel, or (some Chromebook voices) no event at all,
  // which the watch below catches by seeing the voice go quiet AFTER it started.
  // A voice that never starts is left alone: the page's own no-sound wait handles that.
  const finish = e => {
    if (ended) return;
    ended = true;
    clearInterval(watch);
    clearTimeout(hlTimer);
    spans.forEach(s => s.classList.remove('hl'));
    liveUtterances.delete(u);
    if (prevE) prevE(e || {});
  };
  u.onend = finish;
  u.onerror = finish;
  // Chrome can drop an utterance's events if nothing else holds on to it.
  liveUtterances.add(u);
  let started = false, quietTicks = 0;
  const prevS = u.onstart;
  u.onstart = e => { started = true; if (prevS) prevS(e); };
  const watch = setInterval(() => {
    const voice = window.speechSynthesis;
    if (voice.speaking) { started = true; quietTicks = 0; return; }
    quietTicks = started && !voice.pending ? quietTicks + 1 : 0;
    if (quietTicks >= 2) finish();
  }, 400);
  const step = () => {
    if (fired || ended) return;
    spans.forEach(s => s.classList.remove('hl'));
    if (i >= spans.length) return;
    const w = spans[i++];
    w.classList.add('hl');
    const len = (w.textContent || '').replace(/[^A-Za-z0-9]/g, '').length;
    hlTimer = setTimeout(step, Math.max(280, len * 70 + 120) / (u.rate || 1));
  };
  clearTimeout(hlTimer);
  hlTimer = setTimeout(step, 500);
}

/* ── HELPERS ────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFirstName(name) {
  if (!name) return 'Student';
  const parts = name.split(',');
  return parts.length > 1 ? parts[1].trim().split(' ')[0] : name.split(' ')[0];
}

/* Light the word the voice is on. The voice says where it is in the text (charIndex); it does NOT signal every
   word — Samantha in Chrome gave no signal for "example:" after "For" (measured in Marcos's Chrome 10/28) — so
   moving one word per signal fell further behind with each skipped word ("the highlighting can't keep up").
   The spoken text has one token per span, joined by single spaces. */
function lightAt(spans, text, charIndex) {
  let j = 0, start = 0;
  String(text).split(' ').forEach((tok, k) => { if (start <= charIndex) j = k; start += tok.length + 1; });
  spans.forEach(sp => sp.classList.remove('hl'));
  if (spans[j]) spans[j].classList.add('hl');
}
function wrapWords(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let idx = 0;
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/—/g, ' — ').replace(/  +/g, ' ');
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(part => {
        if (/\S/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'wrd';
          sp.dataset.wi = idx++;
          sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else {
      [...node.childNodes].forEach(walk);
    }
  }
  walk(tmp);
  return tmp.innerHTML;
}

function escapeHtml(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function choiceHtml(text) {
  return text.replace(/—/g, ' — ');
}

function getSectionAttempts(name) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  const counts = { vocab: 0, comp: 0, cloze: 0 };
  scores.filter(s => s.name === name && s.done).forEach(s => {
    if (counts[s.section] !== undefined) counts[s.section]++;
  });
  return counts;
}

function allSectionsCompletedOnce(name) {
  const a = getSectionAttempts(name);
  return a.vocab >= 1 && a.comp >= 1 && a.cloze >= 1;
}

function applyLocks(name) {
  const attempts = getSectionAttempts(name);
  const allDone1 = allSectionsCompletedOnce(name);

  ['vocab', 'comp', 'cloze'].forEach(sec => {
    const btn = document.getElementById(`btn-${sec}`);
    if (!btn) return;
    const done = attempts[sec];

    if (done === 0) {
      btn.classList.remove('locked');
      btn.querySelector('.form-btn-sub').textContent = `${sectionBank(sec).length} questions`;
    } else if (done === 1 && !allDone1) {
      btn.classList.add('locked');
      btn.querySelector('.form-btn-sub').textContent = '✅ Done · finish other sections to retry';
    } else if (done === 1 && allDone1) {
      btn.classList.remove('locked');
      btn.querySelector('.form-btn-sub').textContent = '🔁 Attempt 2 available';
    } else {
      btn.classList.add('locked');
      btn.querySelector('.form-btn-sub').textContent = '🔒 2/2 attempts used';
    }
  });
}

/* ── SPEAK (directions) ─────────────────────────────── */
function speakDir(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();

  const p = btn.closest('.dir-section').querySelector('.dir-text');
  if (!p) return;
  if (!p.querySelector('.wrd')) p.innerHTML = wrapWords(p.innerHTML);

  const spans = Array.from(p.querySelectorAll('.wrd'));
  if (!spans.length) return;

  activeSpeakBtn = btn;
  btn.textContent = '⏹';

  const speechText = spans.map(s => s.textContent).join(' ');
  const u = new SpeechSynthesisUtterance(speechText);
  u.lang = 'en-US';
  u.rate = READ_RATE;

  u.onboundary = e => {
    if (e.name !== 'word') return;
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    lightAt(spans, u.text, e.charIndex);
  };

  u.onend = () => {
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };

  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

/* ── READ-ALOUD INTRO SPEAKS ITSELF ─────────────────
   Marcos 10/6: the "Read Aloud is Available!" screen announces itself
   the moment it opens — no reading, no button. The click on "Let's Get
   Started!" is the user gesture the browser needs. The icons are said
   as words, and each word lights up as it is read. Leaving the screen
   (app.show) cancels the speech. */
const INTRO_SAY = { '🔊': 'the speaker button', '⏹': 'the stop button', '—': ',' };
const READ_RATE = 0.82;    // every read-aloud a student taps (Marcos 10/26: "I like the 0.82. It's clear and easy to listen to.")
const INTRO_RATE = 0.82;   // Marcos 10/6: 0.92 ran ahead of the highlight
let introToken = 0, introTimer = null;
let introMsPerChar = null, introMsPerWord = null;   // learned from this device's voice
function speakReadAloudIntro() {
  stopActiveSpeech();
  clearTimeout(introTimer);
  const screen = document.getElementById('readaloud-screen');
  const els = Array.from(screen.querySelectorAll('.ra-read'));
  els.forEach(el => { if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML); });
  // One piece per SENTENCE (Marcos 10/6: the end of a long sentence lost its
  // highlight). Each piece = the words to say + the on-screen word each one lights.
  const pieces = [];
  els.forEach(el => {
    let words = [], wordSpan = [];
    const flush = () => { if (words.length) pieces.push({ words, wordSpan }); words = []; wordSpan = []; };
    el.querySelectorAll('.wrd').forEach(sp => {
      const t = sp.textContent.replace(/\uFE0F/g, '').trim();
      const key = t.replace(/[.!?,]+$/, ''), punct = t.slice(key.length);   // "🔊." → icon + "."
      let say = INTRO_SAY[key] != null ? INTRO_SAY[key] + punct : (/[A-Za-z0-9]/.test(t) ? t : '');
      if (!say) return;
      if (say === ',') { if (words.length) words[words.length - 1] += ','; return; }
      if (/^the /.test(say) && /^(every|each)$/i.test(words[words.length - 1] || '')) say = say.slice(4);
      // past-tense "read" ("is read aloud") must sound like "red", not "reed" (Marcos 10/6)
      if (/^read[.!?,]?$/i.test(say) && /^(is|was|are|were|be|been|being)$/i.test(words[words.length - 1] || '')) say = say.replace(/^read/i, 'red');
      say.split(' ').forEach(w => { words.push(w); wordSpan.push(sp); });
      if (/[.!?]$/.test(say)) flush();
    });
    if (words.length && !/[.!?,]$/.test(words[words.length - 1])) words[words.length - 1] += '.';
    flush();
  });
  const factor = (typeof READ_SPEEDS !== 'undefined' && typeof readSpeed !== 'undefined' && READ_SPEEDS[readSpeed]) ? READ_SPEEDS[readSpeed].factor : 1;
  const rate = INTRO_RATE * factor;
  const token = ++introToken;
  const live = () => token === introToken && !screen.classList.contains('hidden');
  const sayPiece = k => {
    if (!live() || k >= pieces.length) return;
    const p = pieces[k];
    const text = p.words.join(' ');
    const starts = []; let pos = 0;
    p.words.forEach(w => { starts.push(pos); pos += w.length + 1; });
    const lit = new Set(p.wordSpan);
    let idx = -1, lastHeard = 0, startedAt = 0, viaVoice = false;
    const mark = j => {
      j = Math.max(0, Math.min(j, p.words.length - 1));
      if (j === idx) return;
      idx = j;
      lit.forEach(sp => sp.classList.remove('hl'));
      p.wordSpan[j].classList.add('hl');
    };
    // Watchdog: when the voice goes quiet about word positions (some voices
    // never report them, Chrome sometimes stops partway), step on at a
    // speaking pace — never past the last word, which stays lit until the end.
    // Pace comes from how long this voice really took on the sentences before
    // (first sentence: a guess), so the highlight keeps up on any voice.
    // (a hair quick on purpose: the last word stays lit until the voice ends, so early is safe, late is not)
    const wordMs = w => introMsPerChar ? 0.92 * (w.length + 1) * introMsPerChar : (120 + w.replace(/[^A-Za-z0-9]/g, '').length * 55) / rate;
    const tick = () => {
      if (!live()) return;
      // while the voice is reporting words it leads; step in only once it has gone quiet
      const base = wordMs(p.words[idx] || ''), quiet = Date.now() - lastHeard;
      const avg = Math.max(base, introMsPerWord || 0);   // a normal pause between reported words is never "quiet"
      if (idx >= 0 && viaVoice && quiet > avg * 1.8) {
        const n = Math.max(1, Math.floor(quiet / avg));   // catch up the words said while it was quiet
        viaVoice = false; mark(idx + n); lastHeard += n * avg;
      } else if (idx >= 0 && !viaVoice && quiet > base) {
        mark(idx + 1); lastHeard = Math.min(Date.now(), lastHeard + base);   // keep exact time between steps
      }
      introTimer = setTimeout(tick, 60);
    };
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    u.onstart = () => { startedAt = lastHeard = Date.now(); mark(0); clearTimeout(introTimer); tick(); };
    u.onboundary = e => {
      if (e.name !== 'word') return;
      let j = 0;
      while (j + 1 < starts.length && starts[j + 1] <= e.charIndex) j++;
      mark(j); lastHeard = Date.now(); viaVoice = true;
    };
    u.onend = () => {
      clearTimeout(introTimer);
      const took = Date.now() - startedAt;
      if (startedAt && live() && took > 300) {   // learn the voice's real speed (skip cancelled/odd pieces)
        const perChar = took / (text.length + 1);
        introMsPerChar = introMsPerChar ? (introMsPerChar + perChar) / 2 : perChar;
        const perWord = took / p.words.length;
        introMsPerWord = introMsPerWord ? (introMsPerWord + perWord) / 2 : perWord;
      }
      lit.forEach(sp => sp.classList.remove('hl'));
      if (live()) introTimer = setTimeout(() => sayPiece(k + 1), 250);
    };
    window.speechSynthesis.speak(u);
  };
  sayPiece(0);
}

/* ── SESSION EVENT LOG ───────────────────────────────
   start · leave · return · resume · close · finish, each with the
   on-task clock. elapsed is time ON TASK: the timer pauses while the
   page is hidden and counts ticks, so a slept device cannot inflate it. */
function logEvent(kind, extra) {
  if (!app.events) app.events = [];
  app.events.push(Object.assign({
    at: new Date().toISOString(),
    e:  kind,
    q:  (app.currentIndex || 0) + 1,
    on: app.timerSeconds || 0
  }, extra || {}));
  if (app.events.length > 200) app.events.splice(0, app.events.length - 200);
}

/* ══════════════════════════════════════════════════════
   APP OBJECT
══════════════════════════════════════════════════════ */
/* ── PINNED FORM LABEL (form-label.js) ──────────────────
   A big colored label pinned to the top of the test screens naming
   the form or part this student is on, so Mr. O can read it from
   across the room (Marcos 10/20). show() calls syncFormLabel(). */
const SECTION_LABEL_LOOK = { vocab: ['📚', 'blue'], comp: ['📖', 'purple'], cloze: ['✏️', 'green'] };
function syncFormLabel(screenId) {
  if (!window.FormLabel) return;
  const s = app.currentSection, look = SECTION_LABEL_LOOK[s];
  if (!look || !['quiz-screen', 'end-screen'].includes(screenId)) return FormLabel.hide();
  FormLabel.show(`${look[0]} ${SECTION_LABELS[s]}`, look[1]);
}

const app = {

  /* ── state ── */
  studentName:    '',
  currentSection: '',
  currentBank:    [],
  currentIndex:   0,
  score:          0,
  streak:         0,
  missedQuestions:[],
  responses:      {},
  currentAttemptNum: 1,
  selectedIndices:new Set(),
  questionLocked: false,
  timerSeconds:   0,
  timerInterval:  null,
  timerOn:        false,
  instructInterval: null,
  readInterval:   null,
  nextInterval:   null,

  /* ── screens ── */
  show(id) {
    ['start-screen','readaloud-screen','directions-screen','quiz-screen','end-screen','scoreboard-screen']
      .forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    syncFormLabel(id);
    // Leaving the quiz screen always drops the two-sided Comprehension layout
    if (id !== 'quiz-screen') this._applyCompLayout(false);
    window.scrollTo(0, 0);   // every new screen starts at the top
    hushReadAloud();
  },

  /* ── TWO-SIDED COMPREHENSION LAYOUT ── */
  _applyCompLayout(isComp) {
    const qs = document.getElementById('quiz-screen');
    if (qs) qs.classList.toggle('comp-mode', isComp);
    document.body.classList.toggle('comp-active', isComp);
  },

  _setupStoryPanel() {
    const panel = document.getElementById('story-panel-imgs');
    if (!panel || panel.querySelector('.story-page')) return;
    panel.innerHTML = STORY_PAGES.map(p =>
      `<figure class="story-page" data-page="${p}">
         <span class="story-page-label">Page ${p}</span>
         <img src="assets/story/page-${p}.webp?v=ts1" alt="The Talent Show — page ${p}" class="story-page-img">
       </figure>`
    ).join('');
    // Page positions are only known once the pictures load — open to the
    // current question's page again when each one arrives (first question).
    panel.querySelectorAll('img').forEach(img => img.addEventListener('load', () => {
      const q = this.currentBank[this.currentIndex];
      if (this.currentSection === 'comp' && q) this._focusStoryPage(q.page);
    }));
  },

  /* Open the story to the page this question is about and ring it */
  _focusStoryPage(page) {
    const panel  = document.getElementById('story-panel-imgs');
    const header = document.getElementById('story-panel-header');
    if (!panel) return;
    panel.querySelectorAll('.story-page').forEach(f => f.classList.toggle('story-focus', Number(f.dataset.page) === page));
    const fig = panel.querySelector(`.story-page[data-page="${page}"]`);
    if (header) header.textContent = fig ? `📖 The Talent Show — look at page ${page}` : '📖 The Talent Show';
    if (fig) panel.scrollTop = Math.max(0, fig.offsetTop - 6);
  },

  /* ── INIT ── */
  init() {
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── READ ALOUD INTRO ── */
  showReadAloudIntro() {
    if ((!REVIEW_OPEN && !SHARE_MODE) || isTestDayLocked()) return;
    document.getElementById('welcome-panel').classList.add('hidden');
    this.show('readaloud-screen');
    introTimer = setTimeout(speakReadAloudIntro, 150);   // announces itself (show() just cancelled any speech; leaving first cancels this)
    const btn   = document.getElementById('readaloud-btn');
    const fill  = document.getElementById('readaloud-fill');
    const count = document.getElementById('readaloud-count');
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    count.textContent = 6;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = 'width 6s linear';
      fill.style.width = '0%';
    }));
    let remaining = 6;
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        btn.disabled = false; btn.style.opacity = '1';
        btn.style.cursor = 'pointer'; btn.textContent = "✅ Got It — Show Me the Directions!";
      }
    }, 1000);
  },

  /* ── DIRECTIONS ── */
  showDirections() {
    this.show('directions-screen');
    this.startInstructionsTimer();
  },

  showLogin() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    window.speechSynthesis.cancel();
    document.querySelectorAll('.dir-text .wrd.hl').forEach(e => e.classList.remove('hl'));
    this.studentName = '';
    loggedInName = '';
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    if (SHARE_MODE) this._shareSignIn();
  },

  /* Shared preview: no roster, no student number — straight to the parts. */
  _shareSignIn() {
    loggedInName     = 'Guest';
    this.studentName = 'Guest';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.add('hidden');
    const select = document.getElementById('section-select');
    select.classList.remove('hidden');
    // student-only pieces: the attempt rules and the score history
    select.querySelectorAll('div').forEach(el => {
      if (!el.querySelector('div, button') && /Rules:/.test(el.textContent)) el.style.display = 'none';
    });
    select.querySelectorAll('.score-btn').forEach(el => { el.style.display = 'none'; });
    applyLocks(this.studentName);
    this.checkResume();
  },

  /* ── NAME SELECT ── */
  onNameSelect() {
    const val = document.getElementById('name-select').value;
    const pinSec = document.getElementById('pin-section');
    const guestSec = document.getElementById('guest-name-section');
    document.getElementById('login-error').textContent = '';
    if (!val) { pinSec.classList.add('hidden'); return; }
    pinSec.classList.remove('hidden');
    if (val.startsWith('GUEST:')) {
      guestSec.classList.remove('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter guest code:';
    } else {
      guestSec.classList.add('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter your student number:';
    }
    setTimeout(() => document.getElementById('student-pin').focus(), 80);
  },

  /* ── LOGIN ── */
  attemptLogin() {
    const selVal = document.getElementById('name-select').value;
    const pin    = document.getElementById('student-pin').value.trim();
    const errEl  = document.getElementById('login-error');
    errEl.textContent = '';

    if (!selVal) { errEl.textContent = '⚠️ Please select your name.'; return; }
    if (!pin)    { errEl.textContent = '⚠️ Please enter your student number.'; return; }

    let matched = false;
    let displayName = '';

    if (selVal.startsWith('GUEST:')) {
      const code = selVal.replace('GUEST:', '');
      if (pin === code) {
        const firstName = (document.getElementById('guest-display-name').value || '').trim();
        if (!firstName) { errEl.textContent = '⚠️ Please enter your first name.'; return; }
        matched = true;
        displayName = firstName + ' (Guest)';
      } else {
        errEl.textContent = '❌ Incorrect guest code. Try again.'; return;
      }
    } else {
      const student = ROSTER.find(s => s.name === selVal);
      if (student && student.id === pin) {
        matched = true;
        displayName = selVal;
      } else {
        errEl.textContent = '❌ Incorrect student number. Try again.'; return;
      }
    }

    if (matched) {
      loggedInName       = displayName;
      this.studentName   = displayName;
      document.getElementById('student-pin').value = '';
      document.getElementById('login-error').textContent = '';
      const loginCard = document.getElementById('login-step-card');
      if (loginCard) loginCard.classList.add('hidden');
      document.getElementById('section-select').classList.remove('hidden');
      applyLocks(displayName);
      this.checkResume();
      const rmBtn = document.getElementById('review-mode-btn');
      if (rmBtn) rmBtn.classList.toggle('hidden', displayName !== 'Mr. O (Teacher)');
    }
  },

  /* ── ATTEMPT START ── */
  attemptStart(section) {
    if (!this.studentName) return;
    const attempts = getSectionAttempts(this.studentName);
    const done     = attempts[section];
    const allDone1 = allSectionsCompletedOnce(this.studentName);
    const name1    = getFirstName(this.studentName);

    if (done === 0) {
      this.startSession(section);
    } else if (done === 1 && !allDone1) {
      alert(`⚠️ ${name1}, you need to finish all three sections before you can retry ${SECTION_LABELS[section]}. Complete the remaining sections first!`);
    } else if (done === 1 && allDone1) {
      this.startSession(section);
    } else if (done >= 2 && !unlockedSections.has(section)) {
      this.showPinModal(
        `🔓 Unlock ${SECTION_LABELS[section]}`,
        `${name1} has already used both attempts for ${SECTION_LABELS[section]}. Enter Teacher PIN to allow an extra retry.`,
        () => { unlockedSections.add(section); this.startSession(section); }
      );
    } else {
      this.startSession(section);
    }
  },

  /* ── TEACHER REVIEW MODE ── */
  promptTeacherReview() {
    const pin = prompt('Enter Teacher PIN to access Review Mode:');
    if (pin !== '9377') { if (pin !== null) alert('Incorrect PIN.'); return; }
    this.studentName = 'Mr. O (Teacher)';
    reviewMode = true;
    localStorage.removeItem(STORAGE_KEY);
    this._showReviewPicker();
  },

  _showReviewPicker() {
    const section = prompt('Choose a section to review:\n1 — Vocabulary\n2 — Comprehension\n3 — Cloze\n\nEnter 1, 2, or 3:');
    const map = { '1': 'vocab', '2': 'comp', '3': 'cloze' };
    if (!map[section]) { alert('Invalid choice.'); reviewMode = false; return; }
    const mode = prompt('Choose review mode:\n1 — Manual (you tap Next each question)\n2 — Auto-run (fully automatic)\n\nEnter 1 or 2:');
    if (mode !== '1' && mode !== '2') { alert('Invalid choice.'); reviewMode = false; return; }
    reviewAutoRun = (mode === '2');
    this.startSession(map[section]);
  },

  exitReviewMode() {
    reviewMode    = false;
    reviewAutoRun = false;
    this.stopTimerEngine();
    const banner = document.getElementById('review-mode-banner');
    if (banner) banner.classList.add('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  _autoAnswer() {
    const q = this.currentBank[this.currentIndex];
    const isMulti = Array.isArray(q.answer);
    const answers = isMulti ? q.answer : [q.answer];
    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      if (answers.includes(i)) {
        this.selectedIndices.add(i);
        btn.classList.add('selected');
      }
    });
    setTimeout(() => this.confirmAnswer(), 600);
  },

  /* ── START SESSION ── */
  startSession(section) {
    this.events = []; this.startedAt = new Date().toISOString();
    this.finishedAt = '';
    tabSwitchCount = 0;
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.add('hidden');
    const banner = document.getElementById('review-mode-banner');
    if (banner) {
      banner.classList.toggle('hidden', !reviewMode);
      const label = banner.querySelector('span');
      if (label) label.textContent = reviewAutoRun
        ? '🔍 Teacher Review Mode — auto-run'
        : '🔍 Teacher Review Mode — tap Next to advance';
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TALENT_SESSION_ID_KEY);
    this.currentSection = section;
    this.score          = 0;
    this.streak         = 0;
    this.missedQuestions= [];
    this.responses      = {};
    this.currentIndex   = 0;
    this.questionLocked = false;   // a finished section leaves it set
    this.timerSeconds   = 0;
    this.currentAttemptNum = reviewMode ? 1 : getSectionAttempts(this.studentName)[section] + 1;
    this.sessionBase = SESSION_ID;

    const rawBank = [...sectionBank(section)];

    const shuffleQ = q => {
      const isMulti = Array.isArray(q.answer);
      const indexed = q.choices.map((text, i) => ({ text, origIdx: i }));
      shuffle(indexed);
      const newAnswer = isMulti
        ? q.answer.map(a => indexed.findIndex(c => c.origIdx === a))
        : indexed.findIndex(c => c.origIdx === q.answer);
      return { id: q.id, q: q.q, page: q.page || null, choices: indexed.map(c => c.text), answer: newAnswer };
    };

    if (section === 'comp') {
      // Story details first (shuffled), then the Part A → Part B pairs (pairs shuffled, A always before B)
      const pairIds = window.COMP_PAIRS || [];
      const inPair  = new Set(pairIds.flat());
      const details = rawBank.filter(q => !inPair.has(q.id));
      const pairs = pairIds.map(([a, b]) => [
        rawBank.find(q => q.id === a),
        rawBank.find(q => q.id === b)
      ]).filter(p => p[0] && p[1]);

      shuffle(details);
      shuffle(pairs);

      const flatPairs = pairs.flatMap(([partA, partB]) => {
        const aQ = shuffleQ(partA);
        const bQ = shuffleQ(partB);
        bQ.pairOf = partA.id;   // Part B shows the Part A recap above its choices
        return [aQ, bQ];
      });

      this.currentBank = [...details.map(shuffleQ), ...flatPairs];
    } else {
      this.currentBank = rawBank.map(shuffleQ);
      shuffle(this.currentBank);
    }

    this._enterQuiz();
    logEvent('start');
    this.startTimer();
    this.renderQuestion();
  },

  // Quiz screen in the right layout: Comprehension = story left, question right
  _enterQuiz() {
    const isComp = this.currentSection === 'comp';
    if (isComp) this._setupStoryPanel();
    this.show('quiz-screen');
    this._applyCompLayout(isComp);
  },

  /* ── RESUME ── */
  checkResume() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const rc = document.getElementById('resume-container');
    const sectionSelect = document.getElementById('section-select');
    if (saved && rc) {
      const data = JSON.parse(saved);
      if (this.studentName && data.studentName === this.studentName) {
        rc.classList.remove('hidden');
        const qNum = Math.min(data.currentIndex + 1, data.currentBank.length);
        document.getElementById('resume-detail').textContent =
          `${SECTION_LABELS[data.currentSection]} — Q${qNum} of ${data.currentBank.length}`;
        if (sectionSelect) sectionSelect.classList.add('hidden');
      } else {
        rc.classList.add('hidden');
        if (sectionSelect && this.studentName) sectionSelect.classList.remove('hidden');
      }
    } else if (rc) {
      rc.classList.add('hidden');
      if (sectionSelect && this.studentName) sectionSelect.classList.remove('hidden');
    }
  },

  resumeSession() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    this.studentName    = saved.studentName;
    this.currentSection = saved.currentSection;
    this.currentBank    = saved.currentBank;
    this.currentIndex   = saved.currentIndex;
    this.score          = saved.score;
    this.streak         = saved.streak || 0;
    this.missedQuestions= saved.missedQuestions || [];
    this.responses      = saved.responses || {};
    this.timerSeconds   = saved.timerSeconds || 0;
    this.currentAttemptNum = saved.currentAttemptNum || 1;
    this.sessionBase    = saved.sessionBase || SESSION_ID;
    this.questionLocked = false;
    tabSwitchCount      = saved.tabSwitches || 0;
    this.events = saved.events || [];
    this.startedAt = saved.startedAt || new Date().toISOString();
    this.finishedAt = '';
    logEvent('resume');
    this._enterQuiz();
    this.startTimer();
    // Saved right after answering the last question → nothing left to ask
    if (this.currentIndex >= this.currentBank.length) { this._finishSession(); return; }
    this.renderQuestion();
  },

  saveProgress() {
    if (reviewMode) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      studentName:     this.studentName,
      currentSection:  this.currentSection,
      currentBank:     this.currentBank,
      currentIndex:    this.questionLocked ? this.currentIndex + 1 : this.currentIndex, // answered → resume at the next one
      score:           this.score,
      streak:          this.streak,
      missedQuestions: this.missedQuestions,
      responses:       this.responses,
      timerSeconds:    this.timerSeconds,
      currentAttemptNum: this.currentAttemptNum,
      sessionBase:     this.sessionBase,
      tabSwitches:     tabSwitchCount,
      events: this.events,
      startedAt: this.startedAt
    }));
  },

  discardProgress() {
    this.showPinModal(
      '🗑️ Discard Progress',
      'Enter Teacher PIN to clear the current in-progress session. The student will start fresh.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('resume-container').classList.add('hidden');
        applyLocks(this.studentName);
        this.checkResume();
      }
    );
  },

  /* ── OVERALL TIMER ── */
  startTimer() {
    this.stopTimerEngine();
    this.timerOn = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._tickTimer();
      if (this.timerSeconds % 30 === 0) this.saveProgress();
    }, 1000);
  },

  stopTimerEngine() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerOn = false;
  },

  _tickTimer() {
    const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const s = String(this.timerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  /* ── INSTRUCTIONS LOCK (20s) ── */
  startInstructionsTimer() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    const btn   = document.getElementById('ready-btn');
    const fill  = document.getElementById('instruct-fill');
    const count = document.getElementById('instruct-count');
    if (!btn) return;
    if (reviewMode) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.textContent = "✅ I'm Ready — Let's Begin!"; return; }
    btn.disabled = true;
    btn.style.opacity = '0.45';
    btn.style.cursor  = 'not-allowed';
    if (count) count.textContent = INSTRUCT_SECS;
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${INSTRUCT_SECS}s linear`;
        fill.style.width = '0%';
      }));
    }
    let remaining = INSTRUCT_SECS;
    this.instructInterval = setInterval(() => {
      remaining--;
      if (count) count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.instructInterval);
        this.instructInterval = null;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor  = 'pointer';
        btn.textContent   = "✅ I'm Ready — Let's Begin!";
      }
    }, 1000);
  },

  /* ── READING LOCK (12s) ── */
  startReadTimer() {
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const bar   = document.getElementById('reading-timer-bar');
    const fill  = document.getElementById('reading-fill');
    const count = document.getElementById('reading-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
      setTimeout(() => this._autoAnswer(), 300);
      return;
    }

    bar.classList.remove('hidden');
    count.textContent = READ_SECS;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${READ_SECS}s linear`;
      fill.style.width = '0%';
    }));

    document.querySelectorAll('.answer-btn').forEach(b => {
      b.classList.add('locked-choice');
      b.disabled = true;
    });

    let remaining = READ_SECS;
    this.readInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.readInterval);
        this.readInterval = null;
        bar.classList.add('hidden');
        document.querySelectorAll('.answer-btn').forEach(b => {
          b.classList.remove('locked-choice');
          b.disabled = false;
        });
        document.getElementById('confirm-btn').classList.remove('hidden');
      }
    }, 1000);
  },

  /* ── NEXT SOAK (6s) ── */
  startNextTimer(onDone) {
    if (this.nextInterval) { clearInterval(this.nextInterval); this.nextInterval = null; }
    const bar   = document.getElementById('next-timer-bar');
    const fill  = document.getElementById('next-fill');
    const count = document.getElementById('next-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      if (reviewAutoRun) {
        setTimeout(() => this.nextQuestion(), 800);
      } else {
        document.getElementById('next-btn').classList.remove('hidden');
      }
      return;
    }

    bar.classList.remove('hidden');
    count.textContent = NEXT_SECS;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${NEXT_SECS}s linear`;
      fill.style.width = '0%';
    }));

    let remaining = NEXT_SECS;
    this.nextInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.nextInterval);
        this.nextInterval = null;
        bar.classList.add('hidden');
        document.getElementById('next-btn').classList.remove('hidden');
        if (onDone) onDone();
      }
    }, 1000);
  },

  /* ── RENDER QUESTION ── */
  renderQuestion() {
    const q      = this.currentBank[this.currentIndex];
    const total  = this.currentBank.length;
    const isMulti = Array.isArray(q.answer);

    document.getElementById('progress-text').textContent =
      `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('score-text').textContent =
      `${getFirstName(this.studentName)} · ${this.score}`;
    document.getElementById('progress-fill').style.width =
      `${(this.currentIndex / total) * 100}%`;

    this._renderStreak();

    const qtEl = document.getElementById('question-text');
    const badge    = isMulti ? '<span class="two-answer-badge">Choose TWO</span>' : '';
    qtEl.innerHTML = wrapWords(q.q) + badge;
    this._renderPrevRecap(q);
    if (this.currentSection === 'comp') this._focusStoryPage(q.page);

    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box';
    fb.style.display = 'none';
    fb.textContent = '';

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('next-timer-bar').classList.add('hidden');

    this.selectedIndices = new Set();
    this.questionLocked  = false;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';

    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';

      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<strong>${['A','B','C','D','E'][i]}.</strong>&nbsp;<span class="choice-text">${choiceHtml(text)}</span>`;
      btn.onclick = () => this._selectChoice(i, btn, isMulti);

      const speakBtn = document.createElement('button');
      speakBtn.className = 'choice-speak-btn';
      speakBtn.textContent = '🔊';
      speakBtn.title = 'Read this choice aloud';
      speakBtn.onclick = (e) => {
        e.stopPropagation();
        if (activeSpeakBtn === speakBtn) { stopActiveSpeech(); return; }
        stopActiveSpeech();

        const textSpan = btn.querySelector('.choice-text');
        if (textSpan && !textSpan.querySelector('.wrd')) {
          textSpan.innerHTML = wrapWords(textSpan.innerHTML);
        }
        const spans = textSpan ? Array.from(textSpan.querySelectorAll('.wrd')) : [];

        activeSpeakBtn = speakBtn;
        speakBtn.textContent = '⏹';

        // the words as they show (a dash is a word of its own on screen), so lightAt finds the word the voice is on
        const u = new SpeechSynthesisUtterance(spans.length ? spans.map(s => s.textContent).join(' ') : text);
        u.lang = 'en-US';
        u.rate = READ_RATE;
        u.onboundary = e => {
          if (e.name !== 'word') return;
          textSpan.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          lightAt(spans, u.text, e.charIndex);
        };
        u.onend = () => {
          if (textSpan) textSpan.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          if (activeSpeakBtn === speakBtn) { speakBtn.textContent = '🔊'; activeSpeakBtn = null; }
        };
        addHighlightFallback(u, spans);
        window.speechSynthesis.speak(u);
      };

      row.appendChild(speakBtn);
      row.appendChild(btn);
      wrap.appendChild(row);
    });

    if (this.currentIndex > 0 && this.currentIndex % 5 === 0) {
      submitScorePartial();
    }

    this.saveProgress();

    document.getElementById('answers').classList.remove('hidden');
    this.startReadTimer();
  },

  /* ── PART A RECAP (on its Part B) ──
     Part B keeps the test's wording ("…supports the answer to Part A?"), and
     this box shows what that answer is: one line when the student got Part A
     right; their answer + the correct answer when they got it wrong, because
     Part B asks for the sentence that supports the RIGHT Part A answer. */
  _renderPrevRecap(q) {
    const el = document.getElementById('prev-answer-recap');
    if (!el) return;
    const prev = q.pairOf ? this.responses[q.pairOf] : null;
    if (!prev) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    const line = (cls, label, icon, text) =>
      `<div class="recap-line ${cls}"><span class="recap-label">${label}</span> <span class="recap-ans">${icon}“${choiceHtml(text)}”</span></div>`;
    const lines = prev.correct
      ? line('recap-right', '📌 The answer to Part A:', '', prev.answer)
      : line('recap-wrong', '📌 Your answer to Part A:', '❌ ', prev.pick || '') +
        line('recap-right', 'The correct answer to Part A:', '✅ ', prev.answer);
    el.innerHTML =
      `<div class="recap-head">
         <button class="speak-btn recap-speak" onclick="app.speakRecap(this)" title="Read the answer to Part A aloud">🔊</button>
         <div class="recap-lines">${lines}</div>
       </div>`;
    el.classList.remove('hidden');
  },

  _selectChoice(i, btn, isMulti) {
    if (this.questionLocked) return;
    if (isMulti) {
      if (this.selectedIndices.has(i)) {
        this.selectedIndices.delete(i);
        btn.classList.remove('selected');
      } else {
        this.selectedIndices.add(i);
        btn.classList.add('selected');
      }
    } else {
      document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
      this.selectedIndices = new Set([i]);
      btn.classList.add('selected');
    }
  },

  _renderStreak() {
    const el = document.getElementById('streak-bar');
    if (this.streak >= 3) {
      el.textContent = '🔥'.repeat(Math.min(this.streak, 8)) + ` ${this.streak} in a row!`;
    } else {
      el.textContent = '';
    }
  },

  /* ── CONFIRM ANSWER ── */
  confirmAnswer() {
    if (this.questionLocked) return;   // answered already: a second tap or key must not count it again (10/27)
    if (this.selectedIndices.size === 0) return;
    this.questionLocked = true;

    const q      = this.currentBank[this.currentIndex];
    const isMulti = Array.isArray(q.answer);
    let correct  = false;

    if (isMulti) {
      correct = this.selectedIndices.size === q.answer.length &&
        [...this.selectedIndices].every(v => q.answer.includes(v));
    } else {
      correct = [...this.selectedIndices][0] === q.answer;
    }

    const picked = [...this.selectedIndices].sort((a, b) => a - b).map(i => q.choices[i]).join(' / ');
    const rightText = (isMulti ? q.answer : [q.answer]).map(a => q.choices[a]).join(' / ');
    this.responses[q.id] = { stem: q.q, pick: picked, answer: rightText, correct };

    if (correct) {
      this.score++;
      this.streak++;
    } else {
      this.streak = 0;
      this.missedQuestions.push({ id: q.id, q: plainText(q.q), skill: (window.SKILLS || {})[q.id], yourAnswer: picked, correct: rightText });
    }

    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      btn.disabled = true;
      const isCorrect = isMulti ? q.answer.includes(i) : i === q.answer;
      if (isCorrect)                        btn.classList.add('correct');
      else if (this.selectedIndices.has(i)) btn.classList.add('incorrect');
    });

    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box ' + (correct ? 'correct' : 'incorrect');
    fb.style.display = 'block';
    fb.innerHTML = correct
      ? `✅ <strong>Correct!</strong>`
      : `❌ <strong>Not quite.</strong> The correct answer${isMulti ? 's are' : ' is'}: <strong>${
          (isMulti ? q.answer : [q.answer])
            .map(a => `${['A','B','C','D','E'][a]}. ${q.choices[a]}`).join(' &amp; ')
        }</strong>`;

    const fbSpeakBtn = document.createElement('button');
    fbSpeakBtn.className = 'speak-btn';
    fbSpeakBtn.style.cssText = 'float:left;margin:0 10px 4px 0;';
    fbSpeakBtn.textContent = '🔊';
    const spokenFb = correct
      ? 'Correct!'
      : `Not quite. The correct answer${isMulti ? 's are' : ' is'}: ${
          (isMulti ? q.answer : [q.answer]).map(a => q.choices[a]).join(' and ')
        }`;
    fbSpeakBtn.onclick = () => {
      if (activeSpeakBtn === fbSpeakBtn) { stopActiveSpeech(); return; }
      stopActiveSpeech();
      activeSpeakBtn = fbSpeakBtn; fbSpeakBtn.textContent = '⏹';
      const u = new SpeechSynthesisUtterance(spokenFb);
      u.lang = 'en-US'; u.rate = READ_RATE;
      u.onend = () => { fbSpeakBtn.textContent = '🔊'; if (activeSpeakBtn === fbSpeakBtn) activeSpeakBtn = null; };
      window.speechSynthesis.speak(u);
    };
    fb.prepend(fbSpeakBtn);

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('score-text').textContent = `${getFirstName(this.studentName)} · ${this.score}`;
    this._renderStreak();
    this.saveProgress();
    this.startNextTimer(null);
  },

  /* ── NEXT QUESTION ── */
  nextQuestion() {
    stopActiveSpeech();
    this.currentIndex++;
    if (this.currentIndex >= this.currentBank.length) {
      this._finishSession();
    } else {
      this.renderQuestion();
    }
  },

  /* ── FINISH SESSION ── */
  _finishSession() {
    this.finishedAt = new Date().toISOString(); logEvent('finish');
    this.stopTimerEngine();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TALENT_SESSION_ID_KEY);

    const total = this.currentBank.length;
    const pct   = Math.round((this.score / total) * 100);
    const date  = new Date();

    const scores   = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const attemptNum = this.currentAttemptNum || 1;
    if (!reviewMode && !SHARE_MODE) {   // a visitor's score is never saved, so no attempt lock ever starts
      scores.push({
        name:    this.studentName,
        section: this.currentSection,
        attempt: attemptNum,
        score:   this.score,
        total,
        pct,
        elapsed: this.timerSeconds,
        date:    date.toLocaleDateString(),
        time:    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done:    true
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    }

    submitScoreFinal();

    let letter = 'F', msg = "Let's study this again! 📚";
    if (pct === 100) { letter = 'A+'; msg = "⭐ PERFECT SCORE! ⭐"; }
    else if (pct >= 90) { letter = 'A'; msg = "Outstanding Work! 🌟"; }
    else if (pct >= 80) { letter = 'B'; msg = "Great Job! 👏"; }
    else if (pct >= 70) { letter = 'C'; msg = "Good Effort! 💪"; }
    else if (pct >= 60) { letter = 'D'; msg = "Keep Practicing! 🔄"; }

    this.show('end-screen');

    const reviewNextBtn = document.getElementById('review-next-btn');
    if (reviewNextBtn) reviewNextBtn.classList.toggle('hidden', !reviewMode);

    document.getElementById('final-score-sub').textContent = SHARE_MODE
      ? `${SECTION_LABELS[this.currentSection]} · Guest view — this score was not saved`
      : `${SECTION_LABELS[this.currentSection]} · Attempt ${attemptNum} · ${this.studentName}`;
    document.getElementById('final-msg').textContent = msg;

    const pctEl = document.getElementById('final-percent');
    pctEl.innerHTML =
      `${this.score}/${total}<br><small style="font-size:0.5em;color:${pct>=70?'var(--correct)':'var(--danger)'};">${pct}% · ${letter}</small>`;
    setTimeout(() => pctEl.classList.add('revealed'), 50);

    const missedSec = document.getElementById('missed-section');
    if (this.missedQuestions.length) {
      missedSec.classList.remove('hidden');
      document.getElementById('missed-items').innerHTML =
        this.missedQuestions.map(m =>
          `<div class="missed-item">
            <div class="mi-label">${m.id}</div>
            <div style="margin:3px 0;">${plainText(m.q)}</div>
            ${m.yourAnswer ? `<div>Your answer: <span style="color:var(--danger);">${m.yourAnswer}</span> &nbsp; ✅ Correct: <strong style="color:var(--correct);">${m.correct}</strong></div>` : ''}
          </div>`
        ).join('');
    } else {
      missedSec.classList.add('hidden');
    }

    if (pct >= 80) startConfetti(pct);

    if (!reviewMode && !SHARE_MODE && allSectionsCompletedOnce(this.studentName)) {
      setTimeout(() => this.showScores(true), 3000);
    }
  },

  /* ── SPEAK THE PART A RECAP ──
     Reads the Part A box on a Part B: the answer to Part A, or (when the
     student missed it) their answer and then the correct answer. One
     utterance per line so the word highlight stays in step; tap again to stop. */
  speakRecap(btn) {
    if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    const box = document.getElementById('prev-answer-recap');
    const els = Array.from(box.querySelectorAll('.recap-line'));
    els.forEach(el => { if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML); });
    // each line: the words to light up + what to say (a dash is a short pause; icons are skipped)
    const lines = els.map(el => {
      const spans = [], words = [];
      el.querySelectorAll('.wrd').forEach(s => {
        const t = s.textContent;
        if (/^[—–-]$/.test(t)) { if (words.length) words[words.length - 1] += ','; return; }
        if (!/[A-Za-z0-9]/.test(t)) return;
        spans.push(s); words.push(t);
      });
      return { spans, words };
    }).filter(l => l.spans.length);
    if (!lines.length) return;
    activeSpeakBtn = btn; btn.textContent = '⏹';
    const sayLine = k => {
      if (activeSpeakBtn !== btn) return;
      if (k >= lines.length) { btn.textContent = '🔊'; activeSpeakBtn = null; return; }
      const spans = lines[k].spans;
      let text = lines[k].words.join(' ');
      if (!/[.!?:,]["”’]?$/.test(text)) text += '.';
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = READ_RATE;
      u.onboundary = e => {
        if (e.name !== 'word') return;
        box.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
        lightAt(spans, u.text, e.charIndex);
      };
      u.onend = () => {
        box.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
        sayLine(k + 1);
      };
      addHighlightFallback(u, spans);
      window.speechSynthesis.speak(u);
    };
    sayLine(0);
  },

  /* ── SPEAK QUESTION ── */
  speakQuestion() {
    const qBtn = document.getElementById('speak-q-btn');
    if (activeSpeakBtn === qBtn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    activeSpeakBtn = qBtn;
    qBtn.textContent = '⏹';

    const qtEl    = document.getElementById('question-text');
    const qtSpans = Array.from(qtEl.querySelectorAll('.wrd'));
    const qtText  = qtSpans.map(s => s.textContent).join(' ').replace(/_+/g, 'blank');

    const u = new SpeechSynthesisUtterance(qtText);
    u.lang = 'en-US';
    u.rate = READ_RATE;
    u.onboundary = e => {
      if (e.name !== 'word') return;
      document.querySelectorAll('#question-text .wrd.hl').forEach(el => el.classList.remove('hl'));
      lightAt(qtSpans, u.text, e.charIndex);
    };
    u.onend = () => {
      document.querySelectorAll('#question-text .wrd.hl').forEach(e => e.classList.remove('hl'));
      const b = document.getElementById('speak-q-btn');
      if (activeSpeakBtn === b) { b.textContent = '🔊'; activeSpeakBtn = null; }
    };
    addHighlightFallback(u, qtSpans);
    window.speechSynthesis.speak(u);
  },

  /* ── SCORES ── */
  showScores(autoShow = false) {
    this.show('scoreboard-screen');
    const teacherBtns = document.getElementById('teacher-score-btns');
    if (teacherBtns) teacherBtns.style.display = this.studentName === 'Mr. O (Teacher)' ? 'flex' : 'none';
    if (!reviewMode) this._startScoreLock(autoShow ? 60 : 0);
    const all    = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const listEl = document.getElementById('score-list');
    const noEl   = document.getElementById('no-scores-msg');

    if (!all.length) {
      listEl.innerHTML = '';
      noEl.style.display = 'block';
      return;
    }
    noEl.style.display = 'none';

    const sections = ['vocab','comp','cloze'];

    const summaryCards = sections.map(sec => {
      const best = all.filter(s => s.section === sec && s.done)
        .reduce((b, r) => (!b || r.pct > b.pct) ? r : b, null);
      const label = SECTION_LABELS[sec];
      if (!best) {
        return `<div class="sb-summary-card sb-incomplete">
          <div class="sb-summary-label">${label}</div>
          <div class="sb-summary-grade" style="color:#ccc;">—</div>
          <div class="sb-summary-score" style="color:#aaa;">Not yet completed</div>
        </div>`;
      }
      const grade = letterGradeStudent(best.pct);
      const gc    = best.pct>=90?'#27ae60':best.pct>=80?'#2980b9':best.pct>=70?'#f39c12':best.pct>=60?'#e67e22':'#e74c3c';
      return `<div class="sb-summary-card">
        <div class="sb-summary-label">${label}</div>
        <div class="sb-summary-grade" style="color:${gc};">${grade}</div>
        <div class="sb-summary-score">${best.score}/${best.total} · ${best.pct}%</div>
        <div class="sb-summary-attempt">Best of ${all.filter(s=>s.section===sec&&s.done).length} attempt(s)</div>
      </div>`;
    }).join('');

    const details = sections.map(sec => {
      const rows = all.filter(s => s.section === sec && s.done);
      if (!rows.length) return '';
      const att1 = rows.filter(r => (r.attempt||1) === 1);
      const att2 = rows.filter(r => (r.attempt||1) >= 2);

      const buildTable = (attempts, label, headerColor) => {
        if (!attempts.length) return '';
        return `
          <div style="margin-bottom:14px;">
            <div style="display:inline-block;background:${headerColor};color:white;
                        font-size:0.72rem;font-weight:bold;letter-spacing:1px;
                        text-transform:uppercase;border-radius:6px;padding:3px 10px;
                        margin-bottom:6px;">${label}</div>
            <table class="scoreboard-table">
              <thead><tr><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
              <tbody>
                ${attempts.map(r => {
                  const grade = letterGradeStudent(r.pct);
                  const cls   = r.pct>=90?'score-good':r.pct>=70?'score-ok':'score-bad';
                  return `<tr>
                    <td>${r.score}/${r.total}</td>
                    <td class="${cls}">${r.pct}%</td>
                    <td class="${cls}" style="font-weight:800;">${grade}</td>
                    <td>${r.time||'—'}</td>
                    <td>${r.date}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      };

      return `
        <h3 style="color:var(--primary);margin:22px 0 8px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">
          ${SECTION_LABELS[sec]}
        </h3>
        ${buildTable(att1,'Attempt 1','#1a3a6b')}
        ${buildTable(att2,'Attempt 2','#c0392b')}`;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:6px;font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Best Scores</div>
      <div class="sb-summary-row">${summaryCards}</div>
      <div style="margin-top:24px;">${details}</div>`;
  },

  _startScoreLock(secs) {
    const bar     = document.getElementById('sb-lock-bar');
    const fill    = document.getElementById('sb-lock-fill');
    const count   = document.getElementById('sb-lock-count');
    const buttons = document.querySelectorAll('#scoreboard-screen button:not(#sb-lock-bar button)');
    if (!secs || secs <= 0) { if (bar) bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    count.textContent = secs;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`;
      fill.style.width = '0%';
    }));
    buttons.forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    let remaining = secs;
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        bar.classList.add('hidden');
        buttons.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      }
    }, 1000);
  },

  clearScores() {
    const panel = document.getElementById('clear-confirm-panel');
    panel.classList.remove('hidden');
    document.getElementById('clear-pin-input').value = '';
    document.getElementById('clear-pin-error').textContent = '';
    setTimeout(() => document.getElementById('clear-pin-input').focus(), 80);
  },

  confirmClearScores() {
    const pin = document.getElementById('clear-pin-input').value.trim();
    if (pin === '9377') {
      localStorage.removeItem(SCORES_KEY);
      document.getElementById('clear-confirm-panel').classList.add('hidden');
      this.showScores();
    } else {
      document.getElementById('clear-pin-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('clear-pin-input').value = '';
      document.getElementById('clear-pin-input').focus();
    }
  },

  cancelClearScores() {
    document.getElementById('clear-confirm-panel').classList.add('hidden');
  },

  printResults() {
    const all = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (!all.length) { alert('No scores to print yet!'); return; }
    const sections = ['vocab','comp','cloze'];
    const rows = sections.flatMap(sec =>
      all.filter(s => s.section === sec).map(r => {
        const cc  = r.pct >= 80 ? 'good' : r.pct >= 60 ? 'ok' : 'bad';
        const att = r.attempt || 1;
        const attLabel = att === 1 ? 'Attempt 1' : `Attempt ${att}`;
        const attStyle = att === 1
          ? 'background:#1a3a6b;color:white;padding:2px 7px;border-radius:4px;font-size:0.8em;'
          : 'background:#c0392b;color:white;padding:2px 7px;border-radius:4px;font-size:0.8em;';
        return `<tr>
          <td>${escapeHtml(r.name||'—')}</td>
          <td>${SECTION_LABELS[r.section]}</td>
          <td><span style="${attStyle}">${attLabel}</span></td>
          <td>${r.score}/${r.total}</td>
          <td class="${cc}">${r.pct}%</td>
          <td>${r.time||'—'}</td>
          <td>${r.date}</td>
        </tr>`;
      })
    ).join('');

    const html = `<html><head><title>The Talent Show Review Scores</title>
      <style>body{font-family:Arial;padding:20px;}h2{color:#1a3a6b;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th,td{border:1px solid #ccc;padding:8px 12px;text-align:center;}
      th{background:#1a3a6b;color:white;}
      .good{color:green;font-weight:bold;}.ok{color:orange;font-weight:bold;}.bad{color:red;font-weight:bold;}</style>
      </head><body>
      <h2>The Talent Show Review — Score Report</h2>
      <p>Printed: ${new Date().toLocaleString()}</p>
      <table><tr><th>Name</th><th>Section</th><th>Attempt</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr>${rows}</table>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  },

  /* ── END SCREEN ACTIONS ── */
  tryAgain() {
    stopConfetti();
    this.timerSeconds = 0;
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    applyLocks(this.studentName);
    this.checkResume();
  },

  /* Marcos 10/14: "Back to …" keeps a signed-in student signed in; only Sign Out starts over. */
  backToMenu() {
    if (!this.studentName) { this.restart(); return; }
    this.tryAgain();
  },

  restart() {
    stopConfetti();
    this.stopTimerEngine();
    this.timerSeconds   = 0;
    this.studentName    = '';
    loggedInName        = '';
    unlockedSections    = new Set();
    document.getElementById('name-select').value = '';
    document.getElementById('student-pin').value = '';
    document.getElementById('pin-section').classList.add('hidden');
    document.getElementById('section-select').classList.add('hidden');
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('login-error').textContent = '';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── GLOBAL PIN MODAL ── */
  showPinModal(title, msg, onSuccess) {
    pinModalCallback = onSuccess;
    document.getElementById('pin-modal-title').textContent = title;
    document.getElementById('pin-modal-msg').textContent   = msg;
    document.getElementById('pin-modal-input').value       = '';
    document.getElementById('pin-modal-error').textContent = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-modal-input').focus(), 80);
  },

  confirmPinModal() {
    const pin = document.getElementById('pin-modal-input').value.trim();
    if (pin === '9377') {
      document.getElementById('pin-modal').classList.add('hidden');
      const cb = pinModalCallback;
      pinModalCallback = null;
      if (cb) cb();
    } else {
      document.getElementById('pin-modal-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('pin-modal-input').value = '';
      document.getElementById('pin-modal-input').focus();
    }
  },

  cancelPinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    pinModalCallback = null;
  }
};

/* ── LEAVING ENDS THE READ-ALOUD ──────────────────────
   Marcos 10/23 (the QPS hub): "if I leave I still hear the read aloud". A new screen, another tab
   or leaving the site ends everything being read — the Part A recap, the Read Aloud screen, a
   question — for good, not just the line being said (the next line used to start anyway). */
function hushReadAloud() {
  introToken++; clearTimeout(introTimer);
  stopActiveSpeech();
}
window.addEventListener('pagehide', hushReadAloud);
document.addEventListener('visibilitychange', () => { if (document.hidden) hushReadAloud(); });

/* ── VISIBILITY / UNLOAD ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!app.timerOn) return;
    tabSwitchCount++;
    logEvent('leave');
    app.stopTimerEngine();
    app.saveProgress();
    if (app.instructInterval) { clearInterval(app.instructInterval); }
    if (app.readInterval)     { clearInterval(app.readInterval); app.readInterval = null; app._readLockPaused = true; }
    app._wasTimerRunning = true;
  } else {
    if (!app._wasTimerRunning) return;
    app._wasTimerRunning = false;
    logEvent('return');
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.remove('hidden');
    app.stopTimerEngine();
    app.timerInterval = setInterval(() => {
      app.timerSeconds++;
      app._tickTimer();
      if (app.timerSeconds % 30 === 0) app.saveProgress();
    }, 1000);
    app.timerOn = true;
    // The read lock stopped while the page was hidden; start it over so the
    // answers unlock again (left alone they stayed locked until a refresh).
    if (app._readLockPaused) { app._readLockPaused = false; app.startReadTimer(); }
  }
});

window.addEventListener('beforeunload', () => {
  if (app.timerOn) logEvent('close');
  if (app.timerOn) app.saveProgress();
});

/* ── CONFETTI ────────────────────────────────────────── */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animId = null;

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function startConfetti(pct) {
  particles = [];
  let count, cols;
  if (pct === 100) {
    count = 300;
    cols = ['#FFD700','#c0392b','#FFFACD','#FFA500','#ffffff','#FFD700'];
  } else if (pct >= 90) {
    count = 220;
    cols = ['#1a3a6b','#c0392b','#2ecc71','#3498db','#9b59b6','#e74c3c','#FFD700'];
  } else if (pct >= 80) {
    count = 160;
    cols = ['#1a3a6b','#c0392b','#2ecc71','#3498db','#e74c3c','#9b59b6'];
  } else {
    count = 80;
    cols = ['#1a3a6b','#c0392b','#7f8c8d','#95a5a6','#bdc3c7'];
  }
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      c: cols[~~(Math.random() * cols.length)],
      s: Math.random() * 5 + 3,
      d: Math.random() * 5 + 2,
      r: Math.random() * Math.PI * 2
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r += 0.05);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
    p.y += p.d; p.x += Math.sin(p.r) * 1.5;
    if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
  });
  animId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

/* ── BOOT ────────────────────────────────────────────── */
app.init();

/* ── TEST-DAY LOCK: closed during the test; the Teacher PIN opens it on this computer ── */
(function applyTestDayLock() {
  if (!REVIEW_OPEN || !isTestDayLocked()) return;
  const btn = document.querySelector('.lgs-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('locked');
  btn.textContent = '🔒 Closed During the Test';
  const note = document.createElement('p');
  note.className = 'locked-note';
  note.textContent = 'The review is closed today while you take the test. Ask Mr. O if you need it.';
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'test-day-pin';
  pin.textContent = '🔑 Teacher PIN: open the review on this computer';
  pin.onclick = () => app.showPinModal(
    '🔑 Open the Review',
    'Enter Teacher PIN to open the review on this computer for the rest of today.',
    () => { try { localStorage.setItem(UNLOCK_KEY, todayNY()); } catch (e) {} location.reload(); }
  );
  btn.insertAdjacentElement('afterend', note);
  note.insertAdjacentElement('afterend', pin);
})();

/* ── CLOSED-TO-STUDENTS LOCK ────────────────────────── */
(function applyReviewLock() {
  if (REVIEW_OPEN || SHARE_MODE) return;
  const btn = document.querySelector('.lgs-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('locked');
  btn.textContent = '🔒 Not Open Yet';
  const note = document.createElement('p');
  note.className = 'locked-note';
  note.textContent = "Mr. O will let you know when this review is ready!";
  btn.insertAdjacentElement('afterend', note);
})();

/* ── A KEY ON A HIDDEN BUTTON DOES NOTHING (10/27/2026) ──
   After a tap the keyboard stays on that button, even once it is hidden, so Enter or Space pressed it
   again: a right answer counted twice (13 of 12 on Vocab Practice) and Next skipped a question.
   Enter and Space on a button that is hidden or turned off are now ignored. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = document.activeElement;
  if (el && el.tagName === 'BUTTON' && (el.disabled || !el.getClientRects().length)) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true));
