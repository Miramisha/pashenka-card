'use client';
// @refresh reset
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SPIDER_SONG } from './spider-song';
const spots = [{x:15,y:20},{x:72,y:17},{x:43,y:35},{x:18,y:58},{x:76,y:58}];
export default function SpiderSurprise({ onDiscover, soundEnabled, onActiveChange }: { onDiscover: () => void; soundEnabled: boolean; onActiveChange: (active: boolean) => void }) {
  const [phase,setPhase] = useState<'idle'|'gift'|'play'|'bye'>('idle');
  const [popped,setPopped] = useState<number[]>([]);
  const song = useRef<HTMLAudioElement | null>(null);
  const [songError, setSongError] = useState('');
  const showing = phase !== 'idle';
  useEffect(() => {
    if (!SPIDER_SONG) return;
    const track = new Audio(SPIDER_SONG);
    track.loop = true; track.volume = .4; track.preload = 'auto';
    song.current = track;
    return () => { track.pause(); song.current = null; };
  }, []);
  useEffect(() => {
    const track = song.current;
    if (!track) return;
    function update() {
      if (showing && soundEnabled && !document.hidden) {
        void track!.play().catch(() => setSongError('Не удалось включить песню. Попробуй кнопку звука.'));
      } else track!.pause();
      if (!showing) { track!.currentTime = 0; setSongError(''); }
    }
    update();
    document.addEventListener('visibilitychange', update);
    return () => { document.removeEventListener('visibilitychange', update); track.pause(); };
  }, [showing, soundEnabled]);
  const audioContext = useRef<AudioContext | null>(null);
  useEffect(() => {
    onActiveChange(phase !== 'idle');
  }, [phase, onActiveChange]);
  useEffect(() => () => { void audioContext.current?.close(); }, []);
  useEffect(() => { if (!soundEnabled) void audioContext.current?.suspend(); }, [soundEnabled]);
  function popSound() {
    if (!soundEnabled) return;
    try {
      const ctx = audioContext.current ?? new AudioContext();
      audioContext.current = ctx;
      void ctx.resume().then(() => {
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .14), ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let n = 0; n < samples.length; n++) samples[n] = (Math.random() * 2 - 1) * Math.exp(-n / (ctx.sampleRate * .021));
        const noise = ctx.createBufferSource(); noise.buffer = buffer;
        const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 3200;
        const gain = ctx.createGain(); gain.gain.value = .38;
        noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        noise.onended = () => { noise.disconnect(); filter.disconnect(); gain.disconnect(); };
        noise.start();
      }).catch(() => {});
    } catch { /* Balloons remain playable when audio is unavailable. */ }
  }
  const trigger = useRef<HTMLButtonElement>(null);
  function close(){setPhase('idle');trigger.current?.focus();}
  useEffect(()=>{
    if(phase==='idle') return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape') close();};
    document.addEventListener('keydown',onKey);
    const timer=phase==='gift'?setTimeout(()=>setPhase('play'),1800):phase==='bye'?setTimeout(close,1400):null;
    return ()=>{document.removeEventListener('keydown',onKey);if(timer)clearTimeout(timer);};
  },[phase]);
  function pop(i:number){if(phase!=='play'||popped.includes(i))return;popSound();const next=[...popped,i];setPopped(next);if(next.length===spots.length)setPhase('bye');}
  return <>
    <button ref={trigger} className="spider-secret" aria-label="Загадочная паутинка" onClick={()=>{onDiscover();setPopped([]);setPhase('gift');}}>🕸</button>
    {phase!=='idle'&&<div className={`spider-surprise spider-${phase}`} role="dialog" aria-modal="true" aria-label="Сюрприз от Человека-паука">
      <button className="spider-close" onClick={close} aria-label="Закрыть сюрприз" autoFocus>×</button>
      <div className="spider-instructions" role="status">{songError && <small>{songError}<br/></small>}{phase==='gift'?'Пашенька, это тебе! 🎈':phase==='bye'?'Все шарики лопнули! До встречи, Пашенька ♡':`Лови и лопай шарики! ${popped.length} / ${spots.length}`}</div>
      <div className="spider-visitor"><div className="spider-thread" aria-hidden="true"/><img src="/images/spider-chibi.png" alt="Мультяшный Человек-паук"/><span>{phase==='bye'?'Пока-пока! ♡':'От твоего дружелюбного соседа ♡'}</span></div>
      {spots.map((spot,i)=><button key={i} disabled={phase!=='play'||popped.includes(i)} className={`spider-balloon ${popped.includes(i)?'balloon-popped':''}`} style={{'--bx':`${spot.x}%`,'--by':`${spot.y}%`,'--gift-x':`${39+i*5}%`,'--gift-y':`${30+Math.abs(2-i)*4}%`,'--balloon-hue':`${i*62}deg`,'--sway-delay':`${i*-.4}s`} as CSSProperties} onClick={()=>pop(i)} aria-label={`Лопнуть шарик ${i+1}`}><span aria-hidden="true">{popped.includes(i)?'✧':'🎈'}</span></button>)}
    </div>}
  </>;
}
