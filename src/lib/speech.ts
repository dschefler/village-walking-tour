'use client';

let _voices: SpeechSynthesisVoice[] = [];
let _muted = true; // Voice off by default — user opts in via the Voice toggle

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  _voices = window.speechSynthesis.getVoices();
  if (_voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      _voices = window.speechSynthesis.getVoices();
    }, { once: true });
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (_voices.length === 0) loadVoices();
  // Prefer a natural-sounding English US voice
  return (
    _voices.find(v => v.lang === 'en-US' && /samantha|karen|siri/i.test(v.name)) ||
    _voices.find(v => v.lang === 'en-US') ||
    _voices.find(v => v.lang.startsWith('en')) ||
    _voices[0] ||
    null
  );
}

export function speakSequence(texts: string[], pauseMs = 600) {
  if (_muted || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speakNext = (index: number) => {
    if (index >= texts.length || _muted) return;
    const u = new SpeechSynthesisUtterance(texts[index]);
    u.lang = 'en-US';
    u.rate = 0.92;
    u.pitch = 1;
    u.volume = 1;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = () => setTimeout(() => speakNext(index + 1), pauseMs);
    window.speechSynthesis.speak(u);
  };
  speakNext(0);
}

export function speak(text: string, rate = 0.92) {
  if (_muted) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1;
  u.volume = 1;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function setSpeechMuted(muted: boolean) {
  _muted = muted;
  if (muted) cancelSpeech();
}

export function isSpeechMuted() {
  return _muted;
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Call once after a user gesture (e.g. "Start Walking") to warm up iOS speech.
// Also speaks an audible confirmation so the user knows voice is working.
export function warmUpSpeech() {
  if (!('speechSynthesis' in window)) return;
  loadVoices();
  if (_muted) return; // Don't unlock audio session when voice is off
  // iOS requires speech to start synchronously inside a user gesture.
  // Speak a silent utterance first to unlock the audio session, then the real one.
  const silent = new SpeechSynthesisUtterance('​');
  silent.volume = 0;
  silent.onend = () => {
    if (_muted) return;
    const u = new SpeechSynthesisUtterance('Tour started. Walk toward your first stop.');
    u.lang = 'en-US';
    u.rate = 0.92;
    u.pitch = 1;
    u.volume = 1;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  };
  window.speechSynthesis.speak(silent);
}
