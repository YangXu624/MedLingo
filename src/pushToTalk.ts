import type { Recognition } from './speech.ts';

// Recognition can emit final results *after* stop(). Wait for onend before
// translating, and never speak interim guesses or start playback while held.
export function createPushToTalk(recognition: Recognition, callbacks: {
  transcript: (text: string) => void;
  phase: (phase: 'holding' | 'finishing' | 'idle') => void;
  complete: (text: string) => void;
  error: (message: string) => void;
}, recognitionLanguage = 'en-SG') {
  let held = true, ended = false, disposed = false;
  let finalText = '', interimText = '';
  let timeout: ReturnType<typeof setTimeout> | undefined;
  function cleanup() {
    disposed = true;
    clearTimeout(timeout);
    recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null;
    callbacks.phase('idle');
  }
  function finish() {
    if (disposed || held || !ended) return;
    const value = finalText.trim();
    cleanup();
    if (interimText.trim()) callbacks.error('The browser did not finish transcribing. Hold to speak again, or check and translate the typed text.');
    else if (value) callbacks.complete(value);
    else callbacks.error('No speech was captured. Hold the button, speak, then release. If permission just appeared, allow it and hold again.');
  }
  function stopRecognition() {
    try { recognition.stop(); } catch { /* onstart will retry if permission is pending */ }
  }
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = recognitionLanguage;
  recognition.onstart = () => { if (!held && !disposed) stopRecognition(); };
  recognition.onresult = event => {
    if (disposed) return;
    const results = Array.from(event.results);
    finalText = results.filter(r => r.isFinal).map(r => r[0].transcript).join(' ');
    interimText = results.filter(r => !r.isFinal).map(r => r[0].transcript).join(' ');
    callbacks.transcript([finalText, interimText].filter(Boolean).join(' '));
  };
  recognition.onend = () => { if (disposed) return; ended = true; finish(); };
  recognition.onerror = event => {
    if (disposed) return;
    cleanup();
    try { recognition.abort(); } catch { /* already ended */ }
    callbacks.error(event.error === 'not-allowed'
      ? 'Microphone access was denied. Allow it in your browser, then hold the button again.'
      : `Speech recognition stopped (${event.error}). Hold to try again or type instead.`);
  };
  return {
    start() {
      callbacks.phase('holding');
      try { recognition.start(); } catch { cleanup(); callbacks.error('Could not start the microphone. Please try again or type instead.'); }
    },
    release() {
      if (disposed || !held) return;
      held = false;
      callbacks.phase('finishing');
      if (ended) { finish(); return; }
      stopRecognition(); // onstart retries if microphone permission is still pending.
      timeout = setTimeout(() => {
        if (disposed) return;
        cleanup();
        try { recognition.abort(); } catch { /* already ended */ }
        callbacks.error('Transcription timed out. Check microphone permissions and your connection, then try again.');
      }, 10000);
    },
    cancel() {
      if (disposed) return;
      cleanup();
      try { recognition.abort(); } catch { /* already ended */ }
    },
  };
}
