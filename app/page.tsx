'use client';

// @refresh reset

import { useEffect, useRef, useState } from 'react';
import { useCardAudio } from './use-card-audio';
import SpiderSurprise from './spider-surprise';
import BirthdayFinale from './birthday-finale';
import FoxSurprise from './fox-surprise';
import { Progress, ProgressLabel } from '@/components/ui/progress';

const SECRET_IDS = ['heart', 'stamp', 'envelope', 'valorant', 'spider'] as const;

const wishes = ['Пусть у тебя получается даже то, о чём пока страшно мечтать.', 'Пусть в каждом дне находится повод улыбнуться. А я помогу ♡', 'Желаю тебе верить в себя так же сильно, как я верю в тебя.', 'Пусть рядом будут тепло, любимые люди и что-нибудь вкусное.', 'Ты заслуживаешь всего самого доброго. Сегодня и всегда.'];

export default function Home() {
  const [stun, setStun] = useState<'idle' | 'flash' | 'active' | 'result'>('idle');
  const [spiderActive, setSpiderActive] = useState(false);
  const [foxOpen, setFoxOpen] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const sound = useCardAudio(stun, setStun, spiderActive || birthdayOpen);
  const stunTrigger = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const [kiss, setKiss] = useState(0);
  const [wish, setWish] = useState(-1);
  const [secrets, setSecrets] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const birthdayShown = useRef(false);
  useEffect(() => {
    if (secrets.length !== SECRET_IDS.length || birthdayShown.current || foxOpen || spiderActive || stun !== 'idle' || kiss > 0) return;
    const reveal = setTimeout(() => { birthdayShown.current = true; setBirthdayOpen(true); }, 800);
    return () => clearTimeout(reveal);
  }, [secrets.length, spiderActive, stun, kiss, foxOpen]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const letter = useRef<HTMLElement>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (stun === 'idle') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setStun('idle'); stunTrigger.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [stun]);
  function closeStun() { setStun('idle'); stunTrigger.current?.focus(); }
  function discover(id: string, text: string) {
    setSecrets(previous => previous.includes(id) ? previous : [...previous, id]);
    setMessage(text);
  }
  function sendKiss() {
    setKiss(previous => previous + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setKiss(0), 2600);
  }
  return (
    <main>
      <FoxSurprise open={foxOpen} onClose={() => setFoxOpen(false)}/>
      <BirthdayFinale soundEnabled={sound.enabled} onToggleSound={sound.toggle} open={birthdayOpen} onClose={() => setBirthdayOpen(false)}/>
      <SpiderSurprise soundEnabled={sound.enabled} onActiveChange={setSpiderActive} onDiscover={() => discover('spider', 'Дружелюбный сосед тоже приготовил для тебя сюрприз! 🕸️')}/>
      <div className="sound-control"><button className="sound-toggle" onClick={sound.toggle} aria-pressed={sound.enabled} aria-label={sound.enabled ? 'Выключить звук' : 'Включить звук'}>{sound.enabled ? '♫ Звук включён' : '♫ Включить звук'}</button>{sound.error && <span className="sound-error" role="status">{sound.error}</span>}</div>
      <div ref={sound.content} className={`card-content ${stun === 'active' ? 'is-stunned' : ''}`} inert={stun !== 'idle'}>
      <header className="topline"><span>маленькое письмо о большом чувстве</span><button className="tiny-heart" aria-label="Сердечко в углу" onClick={() => { discover('heart', 'Лисичка подарила тебе сердечко! ♡'); setFoxOpen(true); }}>♡</button></header>
      <section className="intro" aria-labelledby="greeting">
        <div className="eyebrow">ДЛЯ ОДНОГО ОСОБЕННОГО ЧЕЛОВЕКА</div>
        <h1 id="greeting">Пашенька,<br/>это всё <em>тебе.</em></h1>
        <p className="intro-copy">Немного нежности, несколько тёплых слов<br className="desktop-break"/> и одно очень большое «люблю».</p>
        <div className="postcard">
          <div className="card-meta"><span>ЛИЧНО В РУКИ</span><button className="stamp" aria-label="Марка с поцелуем" onClick={() => { discover('stamp', 'Секретная доставка: ещё один поцелуй лично Павлу!'); sendKiss(); }}>💋<small>LOVE POST</small></button></div>
          <div className="address"><span>Кому:</span> моему Пашеньке<span>От кого:</span> от того, кто тебя любит</div>
          <button className="open-letter" onClick={() => { setOpened(!opened); if (!opened) setTimeout(() => letter.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }), 80); }}>{opened ? 'Сложить письмо' : 'Открыть письмо'} <span aria-hidden="true">↗</span></button>
          <span className="handwritten">с любовью, без повода</span>
        </div>
        <p className="aside-note">psst… некоторые детали хранят секреты</p>
      </section>
      {opened && <section className="letter" ref={letter} aria-label="Письмо для Пашеньки">
        <span className="eyebrow">ТОЛЬКО МЕЖДУ НАМИ</span><h2>Мой любимый Пашенька,</h2>
        <p>Хочу, чтобы ты знал: ты делаешь этот мир — и мой мир — теплее. С тобой даже самый обычный день становится особенным.</p>
        <p>Пусть у тебя будет много поводов гордиться собой, смелости для больших мечтаний и сил на всё, что тебе дорого. А когда захочется просто выдохнуть — пусть рядом всегда будут любовь и объятия.</p>
        <p>Спасибо, что ты есть. Именно такой. Именно ты.</p><div className="letter-sign">Обнимаю крепко-крепко ♡</div>
      </section>}
      <section className="love-section"><span className="eyebrow">ТРИ СЛОВА, В КОТОРЫХ ВСЁ</span><h2>Пашенька, <em>люблю тебя.</em></h2><p>И вот тебе кое-что. Лови!</p><button className="kiss-button" onClick={sendKiss}>Люблю тебя <span aria-hidden="true">💋</span></button><span className="microcopy">нажми — поцелуй уже в пути</span></section>
      <section className="wishes wishes-envelope" aria-labelledby="wishes-heading">
        <span className="eyebrow">ЕЩЁ КАПЕЛЬКА ТЕПЛА</span>
        <h2 id="wishes-heading">Пожелание в кармашке</h2>
        <p className="envelope-hint">Маленькие открытки, чтобы сделать твой день теплее.</p>
        <div className={`envelope-scene ${wish >= 0 ? 'envelope-is-open' : ''}`}>
          <div className="envelope-back" aria-hidden="true"/>
          <div className="envelope-flap" aria-hidden="true"/>
          <div className="wish-card-space" aria-live="polite" aria-atomic="true">
            {wish >= 0 && <article className={`mini-wish mini-wish-${wish % 3}`} key={wish}>
              <span className="mini-wish-symbol" aria-hidden="true">{['♡', '✧', '☀', '❀', '♥'][wish]}</span>
              <span className="mini-wish-to">ПАШЕНЬКЕ, С ЛЮБОВЬЮ</span>
              <p>{wishes[wish]}</p>
              <span className="mini-wish-sign">обнимаю тебя</span>
            </article>}
          </div>
          <div className="envelope-front" aria-hidden="true"><div className="envelope-address"><span>Для: Павла</span><span>От кого: от того, кто тебя любит</span></div></div><span className="envelope-seal" aria-hidden="true">♡</span>
          <button className="envelope-hit" onClick={() => { discover('envelope', 'Конверт с тёплыми пожеланиями найден! 💌'); setWish(previous => (previous + 1) % wishes.length); }} aria-label={wish < 0 ? 'Открыть конверт с пожеланиями' : 'Достать следующую открытку'}><span>{wish < 0 ? 'Открыть конверт' : 'Ещё одна открытка'} ↗</span></button>
        </div>
        <span className="envelope-counter">{wish < 0 ? 'Внутри — пять маленьких поводов улыбнуться' : `Открытка ${wish + 1} из ${wishes.length} · нажми на конверт ещё раз`}</span>
      </section>
      <section className="valorant-section"><span className="eyebrow">ЛАДНО, ЕЩЁ ОДИН СЮРПРИЗ</span><button ref={stunTrigger} className="valorant-button" onClick={() => { discover('valorant', 'Сюрприз от Breach найден! ♡'); setStun('flash'); }}>VALORANT <span aria-hidden="true">♡</span></button><p>Доверяешь мне? Нажми :3</p></section>
      <footer><button className="footer-secret" onClick={() => setMessage('Из всех людей на планете я всё равно выбираю тебя. ∞')}>ты + я = <span>∞</span></button><p>Сделано с очень большим чувством</p><div className="secret-meter">
        <Progress className="secret-progress" value={secrets.length} max={SECRET_IDS.length}>
          <ProgressLabel className="secret-progress-label">Найдено секретов <span>{secrets.length} / {SECRET_IDS.length}</span></ProgressLabel>
        </Progress>
        <span className="secret-progress-heart" aria-hidden="true" style={{ left: `${secrets.length / SECRET_IDS.length * 100}%` }}>♥</span>
        <span className="sr-only" role="status">Найдено секретов: {secrets.length} из {SECRET_IDS.length}</span>
      </div><div className="secret-message" role="status">{message}{secrets.length === SECRET_IDS.length && <p>Все секреты твои. Как и моё сердце ♡</p>}</div></footer>
      </div>
      {stun !== 'idle' && <div ref={sound.overlay} className={`stun-overlay stun-${stun}`} role="dialog" aria-modal="true" aria-label={stun === 'flash' ? 'Флешка Breach' : stun === 'active' ? 'Оглушение Breach' : 'Застанила! Хаха'}>
        {stun === 'flash' ? <div className="breach-flash" aria-hidden="true"/> : stun === 'active' ? <><div className="concuss-vignette" aria-hidden="true"/><svg className="concuss-cracks" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="crack-glow"><feGaussianBlur stdDeviation="2.5"/></filter></defs>{['M0 45 L85 90 125 75 180 152 245 175 278 235 340 270 380 355 470 380 510 470 610 530 640 620 705 700','M125 75 L155 0 M180 152 L130 215 65 240 0 225 M278 235 L300 150 270 95 315 0 M380 355 L300 375 260 430 175 465 130 545 40 570 0 620','M1000 65 L925 105 900 180 810 200 755 280 675 310 620 370 510 395 470 380','M900 180 L960 235 1000 225 M810 200 L780 130 810 65 790 0 M675 310 L695 220 640 155 675 85 650 0','M1000 485 L910 460 870 510 800 475 735 500 680 460 620 370 M870 510 L885 605 835 650 850 700 M735 500 L755 585 705 620 705 700','M0 390 L95 345 150 360 205 310 278 325 300 375 M150 360 L160 280 130 215 M175 465 L225 525 210 600 275 650 300 700','M445 0 L420 90 465 150 440 220 480 280 455 345 470 380 M465 150 L555 180 595 250 675 310 M510 470 L475 555 505 610 460 700','M1000 340 L940 310 885 335 830 295 755 280 M610 530 L570 610 610 665 590 700'].map((d, i) => <g key={i}><path className="crack-shadow" d={d}/><path className="crack-glow" d={d}/><path className="crack-core" d={d}/></g>)}</svg><div className="concuss-hud" role="status">ОГЛУШЕНИЕ<div className="concuss-duration"/></div></> : <div className="stun-message"><strong>Застанила!<br/>Хаха 😂</strong><button onClick={closeStun}>Оправиться от стана ♡</button></div>}
        <button className="close-stun" aria-label="Закрыть эффект стана" onClick={closeStun} autoFocus>×</button>
      </div>}
      {kiss > 0 && <div className="kiss-overlay" key={kiss} aria-live="polite" onClick={() => setKiss(0)}><span className="giant-kiss" aria-hidden="true">💋</span><strong>Люблю тебя, Пашенька!</strong><button className="close-kiss" onClick={() => setKiss(0)} aria-label="Закрыть поцелуй">×</button></div>}
    </main>
  );
}
