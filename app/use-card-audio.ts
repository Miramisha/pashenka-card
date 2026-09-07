'use client';

// @refresh reset
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
type Stage = 'idle' | 'flash' | 'active' | 'result';
export const EFFECT_SECONDS = { flash: 3.47, active: 4.60 };
// Keep the opening voice line visible as an unaffected page.
const IMPACT_SECONDS = { flash: 1.7, active: 3.1 };
export function useCardAudio(stage: Stage, advance: (stage: Stage) => void, spiderActive = false) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const music = useRef<HTMLAudioElement | null>(null);
  const effects = useRef<Record<string, HTMLAudioElement>>({});
  const stunPrestarted = useRef(false);
  const started = useRef(false);
  const active = useRef(false);
  const overlay = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const stageRef = useRef(stage);
  const advanceRef = useRef(advance);
  stageRef.current = stage; advanceRef.current = advance;
  useEffect(() => {
    const bg = new Audio('/audio/gymnopedie.mp3');
    bg.loop = true; bg.volume = .2; bg.preload = 'auto'; music.current = bg;
    effects.current = { flash: new Audio('/audio/breach-flash.mp3'), active: new Audio('/audio/breach-stun.mp3') };
    Object.values(effects.current).forEach(a => { a.preload = 'auto'; a.volume = .45; a.load(); });
    function start(event: Event) {
      if (started.current || (event.target instanceof Element && event.target.closest('.sound-toggle'))) return;
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      started.current = true; active.current = true; setEnabled(true);
      Object.values(effects.current).forEach(a => { a.muted = false; });
      void bg.play().catch(() => setError('Нажми кнопку звука, чтобы запустить музыку'));
    }
    const visibility = () => {
      if (document.hidden) bg.pause();
      else if (active.current) void bg.play().catch(() => setError('Нажми кнопку звука для продолжения'));
    };
    document.addEventListener('click', start);
    document.addEventListener('keydown', start);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      bg.pause(); Object.values(effects.current).forEach(a => a.pause());
      document.removeEventListener('click', start); document.removeEventListener('keydown', start); document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const bg = music.current;
    if (!bg) return;
    Object.values(effects.current).forEach(a => { a.muted = !enabled; });
    if (!enabled) { bg.pause(); return; }
    const target = spiderActive ? 0 : stage === 'flash' || stage === 'active' ? .025 : .2;
    const fade = setInterval(() => { bg.volume += (target - bg.volume) * .2; }, 40);
    return () => clearInterval(fade);
  }, [enabled, stage, spiderActive]);
  useLayoutEffect(() => {
    if (stage !== 'flash' && stage !== 'active') {
      Object.values(effects.current).forEach(a => a.pause());
      stunPrestarted.current = false;
      return;
    }
    const clip = effects.current[stage];
    if (!clip) return;
    let cancelled = false, frame = 0, fallback = false, origin = performance.now();
    let hiddenAt: number | null = document.hidden ? origin : null;
    let endedAt: number | null = null;
    const tail = stage === 'flash' ? .5 : 1.5;
    const animations = [...(overlay.current?.getAnimations({ subtree: true }) ?? []), ...(content.current?.getAnimations({ subtree: true }) ?? [])];
    animations.forEach(a => { a.pause(); a.currentTime = 0; });
    overlay.current?.setAttribute('data-windup', 'true');
    content.current?.setAttribute('data-windup', 'true');
    if (stage !== 'active' || !stunPrestarted.current) clip.currentTime = 0;
    if (stage === 'flash') stunPrestarted.current = false;
    clip.muted = !active.current;
    function finish() { if (!cancelled) advanceRef.current(stage === 'flash' ? 'active' : 'result'); }
    function fail() {
      if (cancelled || fallback) return;
      fallback = true; origin = performance.now() - clip.currentTime * 1000;
      if (active.current) setError('Игровой звук недоступен — анимация продолжится без него');
    }
    function onEnded() {
      if (tail > 0) endedAt = performance.now();
      else finish();
    }
    clip.addEventListener('ended', onEnded);
    clip.addEventListener('error', fail);
    void clip.play().catch(fail);
    // Both CSS animations and the phase transition follow the media clock.
    function tick(now: number) {
      if (cancelled) return;
      if (!document.hidden) {
        const seconds = fallback ? (now - origin) / 1000 : clip.currentTime + (endedAt === null ? 0 : (now - endedAt) / 1000);
        const duration = Number.isFinite(clip.duration) && clip.duration > 0 ? clip.duration : EFFECT_SECONDS[stage as 'flash' | 'active'];
        if (stage === 'flash' && !stunPrestarted.current && seconds >= duration + tail - .3) {
          const next = effects.current.active;
          if (next) {
            stunPrestarted.current = true;
            next.currentTime = 0; next.muted = !active.current;
            void next.play().catch(() => { /* The active phase retries playback. */ });
          }
        }
        const impact = IMPACT_SECONDS[stage as 'flash' | 'active'];
        const windingUp = seconds < impact;
        overlay.current?.setAttribute('data-windup', String(windingUp));
        content.current?.setAttribute('data-windup', String(windingUp));
        const progress = Math.max(0, Math.min(1, (seconds - impact) / Math.max(.1, duration + tail - impact)));
        const animationMs = progress * EFFECT_SECONDS[stage as 'flash' | 'active'] * 1000;
        animations.forEach(a => { a.currentTime = animationMs; });
        if ((fallback || endedAt !== null) && seconds >= duration + tail) { finish(); return; }
      }
      frame = requestAnimationFrame(tick);
    }
    const visibility = () => {
      if (document.hidden) { hiddenAt = performance.now(); clip.pause();
        if (stage === 'flash' && stunPrestarted.current) effects.current.active?.pause(); }
      else {
        if (hiddenAt !== null) {
          const hiddenDuration = performance.now() - hiddenAt;
          origin += hiddenDuration;
          if (endedAt !== null) endedAt += hiddenDuration;
        }
        hiddenAt = null;
        if (!fallback && endedAt === null) void clip.play().catch(fail);
        if (stage === 'flash' && stunPrestarted.current) void effects.current.active?.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame); clip.pause();
      overlay.current?.removeAttribute('data-windup');
      content.current?.removeAttribute('data-windup');
      clip.removeEventListener('ended', onEnded); clip.removeEventListener('error', fail);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [stage]);
  function toggle() {
    started.current = true;
    const next = !active.current; active.current = next; setEnabled(next); setError('');
    Object.values(effects.current).forEach(a => { a.muted = !next; });
    if (next && music.current) {
      music.current.volume = ['flash', 'active'].includes(stageRef.current) ? .025 : .2;
      void music.current.play().catch(() => { active.current = false; setEnabled(false); setError('Музыка не загрузилась. Нажми, чтобы повторить.'); });
    } else music.current?.pause();
  }
  return { enabled, toggle, error, overlay, content };
}
