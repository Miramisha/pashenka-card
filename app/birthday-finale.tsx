'use client';
// @refresh reset
import { useEffect, useState, type CSSProperties } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
export default function BirthdayFinale({open,onClose,soundEnabled,onToggleSound}:{open:boolean;onClose:()=>void;soundEnabled:boolean;onToggleSound:()=>void}) {
  const [burst,setBurst]=useState(0);
  useEffect(() => {
    if (!open) return;

    const context = new AudioContext();
    const volume = context.createGain();
    volume.gain.value = soundEnabled ? .22 : 0;
    volume.connect(context.destination);
    let cycle = 0;
    // An original music-box arrangement of the traditional birthday melody.
    const notes = [[67,.5],[67,.5],[69,1],[67,1],[72,1],[71,2],[67,.5],[67,.5],[69,1],[67,1],[74,1],[72,2],[67,.5],[67,.5],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.5],[77,.5],[76,1],[72,1],[74,1],[72,2]];
    function melody() {
      let time = context.currentTime + .06;
      notes.forEach(([pitch,beats]) => {
        const tone = context.createOscillator(), gain = context.createGain();
        tone.type='triangle'; tone.frequency.value=440 * 2 ** ((pitch-69)/12);
        gain.gain.setValueAtTime(0,time); gain.gain.linearRampToValueAtTime(.45,time+.015);
        gain.gain.exponentialRampToValueAtTime(.001,time+beats*.42);
        tone.connect(gain); gain.connect(volume); tone.start(time); tone.stop(time+beats*.42+.02);
        time+=beats*.46;
      });
    }
    function pop() {
      const buffer=context.createBuffer(1,context.sampleRate*.18,context.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length)**3;
      const source=context.createBufferSource(); source.buffer=buffer;
      source.connect(volume); source.start();
    }
    function tick() {
      if(document.hidden) return;
      if(context.state==='suspended') void context.resume().catch(()=>{});
      setBurst(value=>value+1); pop();
      if(cycle%8===0) melody();
      cycle++;
    }
    tick();
    const timer=setInterval(tick,2400);
    const visibility=()=>{ if(document.hidden) void context.suspend(); else void context.resume().catch(()=>{}); };
    document.addEventListener('visibilitychange',visibility);
    return()=>{ clearInterval(timer); document.removeEventListener('visibilitychange',visibility); void context.close(); };
  },[open,soundEnabled]);
  const [out,setOut]=useState(false);
  return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}>
    <DialogContent className="birthday-finale" showCloseButton={false}>
      <DialogClose className="birthday-close" aria-label="Вернуться к открытке">×</DialogClose>
      <div key={burst} className="birthday-confetti" aria-hidden="true">{Array.from({length:140},(_,i)=><i key={i} style={{'--x':`${(i*37)%100}%`,'--delay':`${-(i%35)*.15}s`,'--spin':`${180+i*43}deg`,'--drift':`${i%2?1:-1}`,'--color':['#ef4770','#f9a8c4','#ffcf57','#fff','#b789df'][i%5]} as CSSProperties}/>)}</div>
      <span key={`left-${burst}`} className="party-popper party-left" aria-hidden="true">🎉</span><span key={`right-${burst}`} className="party-popper party-right" aria-hidden="true">🎉</span>
      <button className="birthday-sound" onClick={onToggleSound} aria-pressed={soundEnabled}>{soundEnabled ? "♫ Выключить звук" : "♫ Включить звук"}</button>
      <div className="birthday-inner">
        <span className="eyebrow">ВСЕ СЕКРЕТЫ НАЙДЕНЫ. А ВОТ И ГЛАВНЫЙ ♡</span>
        <DialogTitle className="birthday-title">С днем. рождения!</DialogTitle>
        <DialogDescription className="birthday-description">Пашенька, этот маленький праздник — для тебя.</DialogDescription>
        <div className={`birthday-cake ${out?'candles-out':''}`}>
          <img src="/images/birthday-cake.png" alt="Розовый праздничный торт с клубникой и сердечками"/>
          <div className="birthday-candles" aria-hidden="true">{[0,1,2,3,4].map(i=><span className="birthday-candle" key={i}><span className="candle-flame">🔥</span><span className="candle-wick"/></span>)}</div>
        </div>
        <div className="birthday-wish" role="status">{out?'Пусть всё, что ты загадал, обязательно сбудется ♡':'Загадай самое заветное желание…'}</div>
        <button className="kiss-button birthday-blow" onClick={()=>setOut(true)} disabled={out}>{out?'Желание загадано ♡':'Задуть свечи 🌬️'}</button>
      </div>
    </DialogContent>
  </Dialog>;
}
