'use client';

import { useEffect, useRef, useState } from 'react';
import { Accessibility, X, RotateCcw } from 'lucide-react';

// Visitor display preferences for tenant tour sites. Settings are stored in
// localStorage and applied as classes on <html> (see A11Y_CSS), so they carry
// across every page of the tour. A11Y_INIT_SCRIPT re-applies them before
// first paint to avoid a flash of the default styles.

const STORAGE_KEY = 'tour-a11y';
const TEXT_SIZES = [100, 115, 130, 150];

interface Prefs {
  textSize: number;
  contrast: boolean;
  underline: boolean;
  readable: boolean;
  noMotion: boolean;
}

const DEFAULTS: Prefs = { textSize: 100, contrast: false, underline: false, readable: false, noMotion: false };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyPrefs(p: Prefs) {
  const el = document.documentElement;
  el.style.fontSize = p.textSize === 100 ? '' : `${p.textSize}%`;
  el.classList.toggle('a11y-contrast', p.contrast);
  el.classList.toggle('a11y-underline', p.underline);
  el.classList.toggle('a11y-readable', p.readable);
  el.classList.toggle('a11y-no-motion', p.noMotion);
}

export const A11Y_INIT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}'),e=document.documentElement;if(p.textSize&&p.textSize!==100)e.style.fontSize=p.textSize+'%';if(p.contrast)e.classList.add('a11y-contrast');if(p.underline)e.classList.add('a11y-underline');if(p.readable)e.classList.add('a11y-readable');if(p.noMotion)e.classList.add('a11y-no-motion');}catch(_){}`;

export const A11Y_CSS = `
  html.a11y-contrast .tenant-theme, html.a11y-contrast [data-radix-portal] {
    --background: 0 0% 100%; --foreground: 0 0% 0%; --card: 0 0% 100%; --card-foreground: 0 0% 0%;
    --popover: 0 0% 100%; --popover-foreground: 0 0% 0%; --muted: 0 0% 94%; --muted-foreground: 0 0% 0%;
    --border: 0 0% 0%; --input: 0 0% 0%;
  }
  html.a11y-contrast .tenant-theme :is(.text-gray-400, .text-gray-500, .text-gray-600, .text-gray-700):not(svg) { color: #000; }
  html.a11y-contrast .tenant-theme :is(.opacity-80, .opacity-90) { opacity: 1; }
  html.a11y-contrast .tenant-theme :focus-visible { outline: 3px solid #000; outline-offset: 2px; }
  html.a11y-underline .tenant-theme a { text-decoration: underline; text-underline-offset: 3px; }
  html.a11y-readable .tenant-theme, html.a11y-readable .tenant-theme * {
    font-family: Verdana, Arial, Helvetica, sans-serif !important; letter-spacing: 0.02em; word-spacing: 0.08em;
  }
  html.a11y-no-motion *, html.a11y-no-motion *::before, html.a11y-no-motion *::after {
    animation: none !important; transition: none !important; scroll-behavior: auto !important;
  }
`;

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setPrefs(loadPrefs()), []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const update = (next: Prefs) => {
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const toggles: { key: Exclude<keyof Prefs, 'textSize'>; label: string; hint: string }[] = [
    { key: 'contrast', label: 'High contrast', hint: 'Black text and borders' },
    { key: 'underline', label: 'Underline links', hint: 'Find links without color' },
    { key: 'readable', label: 'Readable font', hint: 'Simpler, wider letters' },
    { key: 'noMotion', label: 'Stop animations', hint: 'Pause motion and fades' },
  ];

  const sizeIndex = TEXT_SIZES.indexOf(prefs.textSize);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility options"
        title="Accessibility options"
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center w-11 h-11 rounded-r-lg bg-primary text-primary-foreground shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
      >
        <Accessibility className="w-6 h-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-label="Accessibility options"
          className="fixed left-12 top-1/2 -translate-y-1/2 z-[60] w-72 max-w-[calc(100vw-4rem)] max-h-[90vh] overflow-y-auto rounded-xl border bg-background text-foreground shadow-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Accessibility</h2>
            <button
              type="button"
              onClick={() => { setOpen(false); buttonRef.current?.focus(); }}
              aria-label="Close accessibility options"
              className="p-1 rounded hover:bg-muted"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2" id="a11y-text-size">Text size</p>
            <div className="flex items-center gap-2" role="group" aria-labelledby="a11y-text-size">
              <button
                type="button"
                onClick={() => update({ ...prefs, textSize: TEXT_SIZES[Math.max(0, sizeIndex - 1)] })}
                disabled={sizeIndex <= 0}
                aria-label="Smaller text"
                className="flex-1 h-10 rounded-md border font-semibold disabled:opacity-40 hover:bg-muted"
              >
                A−
              </button>
              <span className="w-14 text-center text-sm" aria-live="polite">{prefs.textSize}%</span>
              <button
                type="button"
                onClick={() => update({ ...prefs, textSize: TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, sizeIndex + 1)] })}
                disabled={sizeIndex >= TEXT_SIZES.length - 1}
                aria-label="Larger text"
                className="flex-1 h-10 rounded-md border text-lg font-semibold disabled:opacity-40 hover:bg-muted"
              >
                A+
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {toggles.map(({ key, label, hint }) => (
              <button
                key={key}
                type="button"
                aria-pressed={prefs[key]}
                onClick={() => update({ ...prefs, [key]: !prefs[key] })}
                className={`w-full flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left ${prefs[key] ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
              >
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className={`block text-xs ${prefs[key] ? 'opacity-90' : 'text-muted-foreground'}`}>{hint}</span>
                </span>
                <span className="text-xs font-semibold">{prefs[key] ? 'On' : 'Off'}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => update(DEFAULTS)}
            className="mt-4 w-full flex items-center justify-center gap-2 h-9 rounded-md text-sm hover:bg-muted"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset all
          </button>
        </div>
      )}
    </>
  );
}
