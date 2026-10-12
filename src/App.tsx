import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { content, type Photo as PhotoType } from './content/content';
import { Buddy, Flower } from './components/Flower';
import { Garden } from './components/Garden';
import { Photo } from './components/Photo';
import { useGift } from './store';

const Games = lazy(() => import('./Games'));
const DateChapter = lazy(() => import('./DateChapter'));
const chapters = [
  ['birthday', 'Birthday'], ['you', 'Jane'], ['us', 'Us'],
  ['letters', 'Letters'], ['hope', 'For hard days'],
  ['arcade', 'Play'], ['date', 'Oct 18'],
];
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const age = Number(today.slice(0, 4)) - 2007 - (today.slice(5) < '10-12' ? 1 : 0);
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
let deferredInstall: InstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event as InstallPromptEvent;
    window.dispatchEvent(new Event('jane-install-ready'));
  });
  window.addEventListener('appinstalled', () => {
    deferredInstall = null;
    window.dispatchEvent(new Event('jane-install-ready'));
  });
}

function celebrate() {
  confetti({ particleCount: 150, spread: 90, origin: { y: .62 }, colors: ['#f34b96', '#ffd866', '#fff9f2', '#9e6ed9'] });
  if (navigator.vibrate) navigator.vibrate(30);
}
function birthdayShower() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [0, 230, 470].forEach((delay, i) => window.setTimeout(() => confetti({ particleCount: 95, spread: 72, angle: i % 2 ? 135 : 45, startVelocity: 48, gravity: .75, origin: { x: i % 2 ? .96 : .04, y: .32 }, colors: ['#f0649b', '#ffd35e', '#fffdf7', '#ffb5d0'] }), delay));
}
let showerPlayed = false;
function celebrateFirstView(delay = 0) {
  if (showerPlayed) return;
  showerPlayed = true;
  window.setTimeout(birthdayShower, delay);
}

function Sticker({ className = '', label = '', src = content.nailongAsset }: { className?: string; label?: string; src?: string }) {
  return <span className={`nailong-sticker ${className}`} aria-hidden="true"><img src={src} alt="" />{label && <small>{label}</small>}</span>;
}

function InstallButton() {
  const [ready, setReady] = useState(Boolean(deferredInstall));
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  const [help, setHelp] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  useEffect(() => {
    const sync = () => { setReady(Boolean(deferredInstall)); setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)); };
    window.addEventListener('jane-install-ready', sync);
    return () => window.removeEventListener('jane-install-ready', sync);
  }, []);
  if (installed) return null;
  const install = async () => {
    if (!deferredInstall) { setHelp(true); return; }
    const prompt = deferredInstall;
    deferredInstall = null;
    setReady(false);
    await prompt.prompt();
    await prompt.userChoice;
  };
  return <>
    <button className="soft-button install-button" onClick={install}>{ready ? 'Install on your phone' : 'Add to your phone'} <span aria-hidden="true">↓</span></button>
    {createPortal(<AnimatePresence>{help && <motion.div className="install-help-backdrop" role="presentation" onClick={() => setHelp(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="install-help" role="dialog" aria-modal="true" aria-label="Install birthday book" onClick={event => event.stopPropagation()} initial={{ y: 25, scale: .94 }} animate={{ y: 0, scale: 1 }} exit={{ y: 25, scale: .94 }}>
        <button className="modal-close" onClick={() => setHelp(false)} aria-label="Close install instructions">×</button>
        <img src="/app-icon-192.png" alt="" /><span className="kicker">Keep this little world</span><h3>Add it to your phone ♡</h3>
        <p>{isIOS ? 'Open this page in Safari. Tap Share, then Add to Home Screen.' : 'Open your browser menu and choose Install app or Add to Home screen.'}</p>
        <small>It will open from your home screen like an app. The birthday book and photos are saved for offline viewing after this visit.</small>
      </motion.div>
    </motion.div>}</AnimatePresence>, document.body)}
  </>;
}

function Intro() {
  const open = useGift(s => s.open);
  const [page, setPage] = useState<'cover' | 'envelope' | 'letter'>('cover');
  const enter = () => { open(); };
  return <motion.div className="intro diary-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.03 }}>
    <div className="diary-glow" aria-hidden="true" />
    <img className="intro-floating-flower intro-flower-left" src="/assets/flowers/peony.webp" alt="" />
    <img className="intro-floating-flower intro-flower-right" src="/assets/flowers/magnolia.webp" alt="" />
    <img className="intro-garland" src="/assets/flowers/birthday-garland.webp" alt="" aria-hidden="true" />
    <img className="floral-sweep intro-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
    <AnimatePresence mode="wait">
      {page === 'cover' ? <motion.div className="diary-cover-wrap" key="cover" initial={{ opacity: 0, y: 40, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -1 }} exit={{ opacity: 0, rotateY: -85, x: -130, scale: .9 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}>
        <button className="diary-cover" onClick={() => setPage('envelope')} aria-label="Open Jane's birthday diary">
          <span className="diary-spine" aria-hidden="true" />
          <span className="diary-cover-seam" aria-hidden="true" />
          <span className="diary-cover-heading">a little birthday diary<br/>for someone I love</span>
          <span className="diary-cover-label"><small>THIS DIARY BELONGS TO</small><strong>Jane</strong><span>19 years of lovely little moments</span></span>
          <span className="diary-cover-clasp" aria-hidden="true">♡<small>OPEN</small></span>
          <img className="diary-cover-peony" src="/assets/flowers/peony.webp" alt="" />
          <img className="diary-cover-magnolia" src="/assets/flowers/magnolia.webp" alt="" />
          <img className="diary-cover-nailong" src="/assets/nailong/flower-sticker.webp" alt="" />
          <span className="diary-cover-footer">made with all my heart · Angelo</span>
        </button>
        <p className="diary-hint">open the book, then the letter inside ♡</p>
      </motion.div> : <motion.div className={`diary-spread ${page === 'envelope' ? 'sealed' : 'unsealed'}`} key="spread" initial={{ opacity: 0, rotateY: 75, x: 100, scale: .92 }} animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }} exit={{ opacity: 0, y: -25 }} transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}>
        <div className="diary-page diary-letter-page">
          <AnimatePresence mode="wait">{page === 'envelope' ? <motion.div className="diary-envelope-scene" key="envelope" initial={{ opacity: 0, scale: .8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} exit={{ opacity: 0, scale: 1.15, y: -80 }} transition={{ duration: .55 }}>
            <span className="diary-page-top">a note tucked inside</span><h1>A little<br/><em>letter for you.</em></h1>
            <button className="diary-envelope" onClick={() => { setPage('letter'); celebrateFirstView(420); }} aria-label="Open the birthday letter"><span className="diary-envelope-flap"/><span className="diary-envelope-front"/><span className="diary-envelope-seal">♡</span><small>tap to open</small></button>
            <p className="diary-envelope-note">I saved the first page for the birthday girl.</p>
          </motion.div> : <motion.div className="diary-letter-content" key="letter" initial={{ opacity: 0, y: 42, rotate: 4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .6 }}>
            <span className="diary-page-top">dear jane,</span><h1>Happy<br/><em>birthday!</em></h1>
            <p>There are so many things I want you to know. The first one is simple: this little world is yours, and I made it with so much love.</p>
            <p>Take your time. Open the photos, read the letters, play a little, and come back whenever you want a reminder that you matter to me.</p>
            <span className="diary-handwritten">always yours,<br/>Angelo ♡</span>
          </motion.div>}</AnimatePresence>
          <img className="diary-letter-flower" src="/assets/flowers/floral-corner.webp" alt="" />
        </div>
        <div className="diary-page diary-photo-page">
          <div className="diary-page-photo"><img src={content.herPhotos[0].src} alt={content.herPhotos[0].alt} /><span>the birthday girl ♡</span></div>
          <Sticker className="diary-letter-sticker" src="/assets/nailong/plush-sticker.webp" />
          {page === 'letter' ? <button className="diary-enter" onClick={enter}>Turn the page <span>→</span></button> : <p className="diary-photo-hint">psst... open the envelope ♡</p>}
          <button className="diary-back" onClick={() => setPage('cover')}>← Back to the cover</button>
        </div>
      </motion.div>}
    </AnimatePresence>
  </motion.div>;
}

function ThemePicker() {
  const theme = useGift(s => s.theme), setTheme = useGift(s => s.setTheme);
  return <div className="theme-picker" aria-label="Choose a color theme">
    {([['pink', '♡', 'Blush'], ['yellow', '✦', 'Sunny'], ['blend', '✿', 'Both']] as const).map(([id, icon, label]) =>
      <button key={id} title={`${label} theme`} aria-label={`${label} theme`} aria-pressed={theme === id} className={`theme-choice ${id} ${theme === id ? 'active' : ''}`} onClick={() => setTheme(id)}><span>{icon}</span><small>{label}</small></button>)}
  </div>;
}

function BirthdayCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const year = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', year: 'numeric' }).format(now));
  const thisBirthday = new Date(`${year}-10-12T00:00:00+08:00`).getTime();
  const nextYear = now >= thisBirthday ? year + 1 : year;
  const left = new Date(`${nextYear}-10-12T00:00:00+08:00`).getTime() - now;
  const values = [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60, Math.floor(left / 1000) % 60];
  return <div className="birthday-countdown" aria-label={`Countdown to Jane's next birthday on October 12, ${nextYear}`}><span className="birthday-countdown-icon">✿</span><div className="birthday-countdown-label"><small>UNTIL YOUR NEXT BIRTHDAY</small><strong>October 12, {nextYear}</strong></div><div className="birthday-countdown-values">{values.map((value, i) => <span key={i}><b>{String(value).padStart(2, '0')}</b><small>{['days','hrs','min','sec'][i]}</small></span>)}</div></div>;
}

function Nav({ active }: { active: string }) {
  return <nav className="chapter-nav" aria-label="Chapters">
    <a href="#birthday" className="brand"><span>✿</span> for jane.</a>
    <div className="nav-links">{chapters.map(([id, label]) => <a href={`#${id}`} key={id} className={active === id ? 'active' : ''}>{label}</a>)}</div>
    <ThemePicker />
  </nav>;
}

function Hero() {
  const pics = content.herPhotos;
  const reopen = useGift(s => s.reopen);
  useEffect(() => {
    celebrateFirstView(850);
  }, []);
  return <section className="chapter hero" id="birthday">
    <div className="hero-board">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
        <div className="chapter-label">A whole day for you ♡</div>
        <span className="hero-occasion">{today.endsWith('10-12') ? 'IT IS YOUR DAY ♡' : 'THIS ONE IS ALWAYS FOR YOU ♡'}</span>
        <h1>Happy<br/>birthday,<br/><em>Jane!</em></h1>
        <p className="hero-age"><strong>{age}</strong><span>years of being you<br/>and that is everything.</span></p>
        <p className="lead">{content.hero.note}</p>
        <BirthdayCountdown />
        <div className="hero-actions"><button className="primary" onClick={celebrate}>Make it rain confetti ✦</button><a className="soft-button" href="#you">See what I made ↓</a><InstallButton /><button className="book-again" onClick={() => { showerPlayed = false; window.scrollTo({ top: 0, behavior: 'instant' }); reopen(); }}>Open the book again ↺</button></div>
        <p className="hero-sign">always rooting for you,<br/><b>Angelo ♡</b></p>
      </motion.div>
      <motion.div className="hero-collage" aria-label="Photos of Jane" initial={{ opacity: 0, x: 45, rotate: 4 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: .85, delay: .15 }}>
        <div className="hero-sunburst" aria-hidden="true" />
        {pics.slice(0, 3).map((p, i) => <div className={`hero-photo hero-photo-${i}`} key={p.src}>
          <img src={p.src} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} style={{ objectPosition: p.position || 'center' }} />
          <span>{i === 0 ? 'birthday girl ♡' : i === 1 ? 'so proud of you' : 'my silly little girl'}</span>
        </div>)}
        <Sticker className="hero-sticker" src="/assets/nailong/magnolia-sticker.webp" label="hbd jane!" />
        <span className="hero-sparkle hero-sparkle-one">✦</span><span className="hero-sparkle hero-sparkle-two">✿</span>
      </motion.div>
      <img className="hero-floral hero-floral-peony" src="/assets/flowers/peony.webp" alt="" aria-hidden="true" />
      <img className="hero-floral hero-floral-magnolia" src="/assets/flowers/magnolia.webp" alt="" aria-hidden="true" />
      <img className="hero-garland" src="/assets/flowers/birthday-garland.webp" alt="" aria-hidden="true" />
      <img className="floral-sweep hero-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
    </div>
    <div className="hero-bottom-strip">a little corner of the internet, always yours <span>♡</span></div>
  </section>;
}

function Gallery({ onPhoto }: { onPhoto: (p: PhotoType) => void }) {
  return <section className="chapter gallery-chapter" id="you">
    <img className="section-flower gallery-flower" src="/assets/flowers/magnolia.webp" alt="" aria-hidden="true" />
    <motion.div className="gallery-top" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .65 }}><div><div className="chapter-label">The Jane gallery ♡</div><span className="kicker">A very biased gallery</span><h2>Look at <em>you.</em></h2><p>I have seen these photos so many times, and I still stop at your smile. I wanted to keep a few of my favorites here for you.</p></div><span className="gallery-count">8 little reminders<br/>of one big love ♡</span></motion.div>
    <div className="gallery-strip">{content.herPhotos.map((p, i) => <Photo photo={p} key={p.src} onClick={() => onPhoto(p)} className={`gallery-photo tilt-${i % 4}`} />)}</div>
    <Sticker className="gallery-nailong" label="she's the best" src="/assets/nailong/flower-sticker.webp" />
    <img className="gallery-garland" src="/assets/flowers/birthday-garland.webp" alt="" aria-hidden="true" />
    <img className="floral-sweep gallery-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
  </section>;
}

function Us({ onPhoto }: { onPhoto: (p: PhotoType) => void }) {
  return <section className="chapter us-chapter" id="us">
    <div className="chapter-label">The pages with us ♡</div>
    <img className="section-flower us-flower" src="/assets/flowers/peony.webp" alt="" aria-hidden="true" />
    <motion.div className="chapter-intro" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .65 }}><span className="kicker">A random hello, and then...</span><h2>My favorite <em>plot twist.</em></h2><p>We met randomly online. Somewhere between all our conversations, an ordinary hello became my favorite part of the day.</p></motion.div>
    <div className="memory-timeline">{content.usPhotos.map(p => <motion.article className="memory" key={p.src} initial={{ opacity: 0, y: 55, rotate: -1 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: .22 }} transition={{ duration: .65 }}>
      <div className="memory-photo"><Photo photo={p} onClick={() => onPhoto(p)} /></div>
      <div className="memory-copy"><span className="scene-tag">{p.date || 'our story'} ♡</span><h3>{p.scene || 'A moment worth keeping'}</h3><p>{p.caption}</p><span className="memory-heart">♡</span></div>
    </motion.article>)}</div>
    <p className="us-outro">To be continued, together. ♡</p>
    <img className="floral-sweep us-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
  </section>;
}

function Letters() {
  const opened = useGift(s => s.letters), open = useGift(s => s.openLetter);
  const [current, setCurrent] = useState<number | null>(null);
  return <section className="chapter letters-chapter" id="letters">
    <div className="chapter-label">Handwritten, just for you ♡</div>
    <img className="section-flower letters-flower" src="/assets/flowers/floral-corner.webp" alt="" aria-hidden="true" />
    <div className="chapter-intro"><span className="kicker">Keep these words close</span><h2>Three letters.<br/><em>All for you.</em></h2><p>Read them in order, as slowly as you like. They are here whenever you need them.</p></div>
    <div className="letter-envelopes">{content.letters.map((letter, i) => {
      const available = i === 0 || opened.includes(i - 1);
      return <motion.button key={letter.title} className={`letter-card ${opened.includes(i) ? 'opened' : ''}`} disabled={!available} onClick={() => { open(i); setCurrent(i); }} initial={{ opacity: 0, y: 35, rotate: i === 1 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: i === 1 ? 1 : -1 }} whileHover={available ? { y: -9, rotate: 0 } : undefined} viewport={{ once: true }} transition={{ duration: .5, delay: i * .12 }}>
        <span className="letter-number">A little letter · {letter.seal}</span><span className="letter-card-art"><Flower kind={i === 1 ? 'magnolia' : 'peony'} /></span><strong>{letter.title}</strong>
        <small>{!available ? 'Read the previous letter first' : opened.includes(i) ? 'Read again ↗' : 'Open this letter ↗'}</small>
      </motion.button>;
    })}</div>
    <AnimatePresence>{current !== null && <motion.div className="letter-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCurrent(null)}>
      <motion.div role="dialog" aria-modal="true" aria-label={content.letters[current].title} className="letter-paper" initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setCurrent(null)} aria-label="Close letter">×</button><p className="kicker">A note from Angelo</p><h3>{content.letters[current].title}</h3>
        {content.letters[current].text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}<p className="letter-sign">With love, Angelo ♡</p>
      </motion.div>
    </motion.div>}</AnimatePresence>
    <img className="floral-sweep letters-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
  </section>;
}

function Hope() {
  const [note, setNote] = useState<number | null>(null), [affirmation, setAffirmation] = useState(0);
  return <section className="chapter hope-chapter" id="hope">
    <div className="chapter-label">A soft place to land ♡</div>
    <img className="section-flower hope-flower" src="/assets/flowers/magnolia.webp" alt="" aria-hidden="true" />
    <div className="chapter-intro"><span className="kicker">For the harder days</span><h2>Come here when<br/><em>you need a pause.</em></h2><p>Things can get better. You can do this. And you do not have to do it alone.</p></div>
    <div className="hope-grid"><div className="hope-card open-when"><h3>Open when...</h3><div className="when-grid">{content.openWhen.map((x, i) => <button key={x.label} className={note === i ? 'active' : ''} onClick={() => setNote(i)}>✉ <span>{x.label}</span></button>)}</div><div className="when-message" role="status" key={note ?? 'empty'}>{note === null ? 'Choose the note you need today.' : content.openWhen[note].message}</div></div>
      <Garden />
      <div className="hope-card breathe"><div className="breathing-flower"><Flower kind="magnolia" /></div><h3>One breath at a time</h3><p>Breathe in as the flower grows. Breathe out as it settles.</p><button className="soft-button" onClick={() => setAffirmation(x => (x + 1) % content.affirmations.length)}>Another gentle reminder</button><p role="status">{content.affirmations[affirmation]}</p></div>
    </div>
    <img className="floral-sweep hope-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" />
  </section>;
}

function FloatingPetals() {
  return <div className="floating-petals" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} style={{ left: `${7 + i * 11}%`, animationDelay: `${-3 * i}s`, animationDuration: `${16 + 2 * i}s` }} />)}</div>;
}

export default function App() {
  const theme = useGift(s => s.theme), opened = useGift(s => s.opened);
  const secretUnlocked = useGift(s => s.stickers.includes('secret'));
  const unlock = useGift(s => s.unlock);
  const [active, setActive] = useState('birthday'), [lightbox, setLightbox] = useState<PhotoType | null>(null), [secret, setSecret] = useState(0);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (!opened) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-35% 0px -55% 0px' });
    document.querySelectorAll('section.chapter').forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [opened]);
  useEffect(() => { const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); }; window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc); }, []);

  return <><AnimatePresence>{!opened && <Intro />}</AnimatePresence>{opened && <>
    <FloatingPetals /><Nav active={active} /><main><Hero /><Gallery onPhoto={setLightbox} /><Us onPhoto={setLightbox} /><Letters /><Hope />
      <Suspense fallback={<div className="loading-chapter">A little magic is loading... ✿</div>}><Games /><DateChapter /></Suspense>
    </main>
    <div className="buddy-anchor"><Buddy onClick={() => setSecret(n => { if (n >= 6) { unlock('secret'); celebrate(); return 0; } return n + 1; })} /></div>
    {secret === 6 && <div className="secret-note" role="status">One more hello... ♡</div>}
    {secretUnlocked && <div className="secret-reward">A secret from your little yellow buddy: Angelo loves the way you keep finding reasons to smile. ♡</div>}
    <AnimatePresence>{lightbox && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
      <button className="modal-close" onClick={() => setLightbox(null)} aria-label="Close photo">×</button><img src={lightbox.src} alt={lightbox.alt} /><p>{lightbox.caption}</p>
    </motion.div>}</AnimatePresence>
  </>}</>;
}
