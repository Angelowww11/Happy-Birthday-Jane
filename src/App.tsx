import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { content, type Photo as PhotoType } from './content/content';
import { Buddy, Flower } from './components/Flower';
import { Photo } from './components/Photo';
import { useGift } from './store';

const Games = lazy(() => import('./Games'));
const DateChapter = lazy(() => import('./DateChapter'));
const chapters = [
  ['birthday', 'Birthday'], ['you', 'Jane'], ['us', 'Us'],
  ['letters', 'Letters'], ['hope', 'For hard days'],
  ['arcade', 'Play'], ['date', 'Oct 19'],
];
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const age = Number(today.slice(0, 4)) - 2007 - (today.slice(5) < '10-12' ? 1 : 0);

function celebrate() {
  confetti({ particleCount: 150, spread: 90, origin: { y: .62 }, colors: ['#f34b96', '#ffd866', '#fff9f2', '#9e6ed9'] });
  if (navigator.vibrate) navigator.vibrate(30);
}

function Sticker({ className = '', label = '' }: { className?: string; label?: string }) {
  return <span className={`nailong-sticker ${className}`} aria-hidden="true"><img src={content.nailongAsset} alt="" />{label && <small>{label}</small>}</span>;
}

function Intro() {
  const open = useGift(s => s.open);
  const enter = () => { open(); celebrate(); };
  return <motion.div className="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.03 }}>
    <div className="intro-sparkles" aria-hidden="true">✦　♡　✿　✦　♡　✿</div>
    <div className="intro-cover">
      <div className="intro-cover-inner">
        <span className="intro-label">A tiny corner of the internet, made just for you</span>
        <div className="intro-envelope-wrap">
          <button className="envelope" onClick={enter} aria-label="Open your birthday letter">
            <span className="envelope-back"/><span className="envelope-paper">To my baby Jane ♡</span>
            <span className="envelope-flap"/><span className="wax"><Flower/></span>
          </button>
          <Sticker className="intro-sticker" label="open it!" />
        </div>
        <h1>It's your day,<br/><em>Jane!</em></h1>
        <p>Nineteen years of you. I made you something to keep.</p>
        <button className="primary intro-open" onClick={enter}>Open your birthday gift <span>↗</span></button>
        <span className="intro-sign">love, Angelo</span>
      </div>
    </div>
  </motion.div>;
}

function ThemePicker() {
  const theme = useGift(s => s.theme), setTheme = useGift(s => s.setTheme);
  return <div className="theme-picker" aria-label="Choose a color theme">
    {([['pink', 'Peony pink'], ['yellow', 'Nailong yellow'], ['blend', 'Pink and yellow']] as const).map(([id, label]) =>
      <button key={id} title={label} aria-label={label} aria-pressed={theme === id} className={`theme-dot ${id} ${theme === id ? 'active' : ''}`} onClick={() => setTheme(id)} />)}
  </div>;
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
  return <section className="chapter hero" id="birthday">
    <div className="hero-board">
      <div className="hero-copy">
        <div className="chapter-label">The birthday page / 01</div>
        <span className="hero-occasion">{today.endsWith('10-12') ? 'IT IS YOUR DAY ♡' : 'THIS ONE IS ALWAYS FOR YOU ♡'}</span>
        <h1>Happy<br/>birthday,<br/><em>Jane!</em></h1>
        <p className="hero-age"><strong>{age}</strong><span>years of being you<br/>and that is everything.</span></p>
        <p className="lead">{content.hero.note}</p>
        <div className="hero-actions"><button className="primary" onClick={celebrate}>Make it rain confetti ✦</button><a className="soft-button" href="#you">See what I made ↓</a></div>
        <p className="hero-sign">always rooting for you,<br/><b>Angelo ♡</b></p>
      </div>
      <div className="hero-collage" aria-label="Photos of Jane">
        <div className="hero-sunburst" aria-hidden="true" />
        {pics.slice(0, 3).map((p, i) => <div className={`hero-photo hero-photo-${i}`} key={p.src}>
          <img src={p.src} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} style={{ objectPosition: p.position || 'center' }} />
          <span>{i === 0 ? 'birthday girl ♡' : i === 1 ? 'so proud of you' : 'just Jane things'}</span>
        </div>)}
        <Sticker className="hero-sticker" label="hbd jane!" />
        <span className="hero-sparkle hero-sparkle-one">✦</span><span className="hero-sparkle hero-sparkle-two">✿</span>
      </div>
    </div>
    <div className="hero-bottom-strip">THE JANE BIRTHDAY CLUB <span>♡</span> EST. 12 OCT 2007 <span>♡</span> ALL THE LOVE IN THE WORLD</div>
  </section>;
}

function Gallery({ onPhoto }: { onPhoto: (p: PhotoType) => void }) {
  return <section className="chapter gallery-chapter" id="you">
    <div className="gallery-top"><div><div className="chapter-label">The Jane files / 02</div><span className="kicker">A very biased gallery</span><h2>Look at <em>you.</em></h2><p>Not just the photos. The person in them. The one who cares so much, keeps going, and makes my days better.</p></div><span className="gallery-count">8 little reminders<br/>of one big love ♡</span></div>
    <div className="gallery-strip">{content.herPhotos.map((p, i) => <Photo photo={p} key={p.src} onClick={() => onPhoto(p)} className={`gallery-photo tilt-${i % 4}`} />)}</div>
    <Sticker className="gallery-nailong" label="she's the best" />
  </section>;
}

function Us({ onPhoto }: { onPhoto: (p: PhotoType) => void }) {
  return <section className="chapter us-chapter" id="us">
    <div className="chapter-label">Our story / 03</div>
    <div className="chapter-intro"><span className="kicker">A random hello, and then...</span><h2>My favorite <em>plot twist.</em></h2><p>We met randomly online. Somewhere between all our conversations, an ordinary hello became my favorite part of the day.</p></div>
    <div className="memory-timeline">{content.usPhotos.map((p, i) => <article className="memory" key={p.src}>
      <div className="memory-photo"><Photo photo={p} onClick={() => onPhoto(p)} /></div>
      <div className="memory-copy"><span className="scene-tag">SCENE {String(i + 1).padStart(2, '0')} / {p.date || 'OUR STORY'}</span><h3>{p.scene || 'A moment worth keeping'}</h3><p>{p.caption}</p><span className="memory-heart">♡</span></div>
    </article>)}</div>
    <p className="us-outro">To be continued, together. ♡</p>
  </section>;
}

function Letters() {
  const opened = useGift(s => s.letters), open = useGift(s => s.openLetter);
  const [current, setCurrent] = useState<number | null>(null);
  return <section className="chapter letters-chapter" id="letters">
    <div className="chapter-label">The things I mean / 04</div>
    <div className="chapter-intro"><span className="kicker">Keep these words close</span><h2>Three letters.<br/><em>All for you.</em></h2><p>Read them in order, as slowly as you like. They are here whenever you need them.</p></div>
    <div className="letter-envelopes">{content.letters.map((letter, i) => {
      const available = i === 0 || opened.includes(i - 1);
      return <button key={letter.title} className={`letter-card ${opened.includes(i) ? 'opened' : ''}`} disabled={!available} onClick={() => { open(i); setCurrent(i); }}>
        <span className="letter-number">LETTER {letter.seal}</span><span className="mini-envelope"><Flower /></span><strong>{letter.title}</strong>
        <small>{!available ? 'Read the previous letter first' : opened.includes(i) ? 'Read again ↗' : 'Open this letter ↗'}</small>
      </button>;
    })}</div>
    <AnimatePresence>{current !== null && <motion.div className="letter-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCurrent(null)}>
      <motion.div role="dialog" aria-modal="true" aria-label={content.letters[current].title} className="letter-paper" initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setCurrent(null)} aria-label="Close letter">×</button><p className="kicker">A note from Angelo</p><h3>{content.letters[current].title}</h3>
        {content.letters[current].text.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}<p className="letter-sign">With love, Angelo ♡</p>
      </motion.div>
    </motion.div>}</AnimatePresence>
  </section>;
}

function Hope() {
  const [note, setNote] = useState<number | null>(null), [affirmation, setAffirmation] = useState(0);
  const blooms = useGift(s => s.blooms), bloom = useGift(s => s.bloom);
  return <section className="chapter hope-chapter" id="hope">
    <div className="chapter-label">A soft place to land / 05</div>
    <div className="chapter-intro"><span className="kicker">For the harder days</span><h2>Come here when<br/><em>you need a pause.</em></h2><p>Things can get better. You can do this. And you do not have to do it alone.</p></div>
    <div className="hope-grid"><div className="hope-card open-when"><h3>Open when...</h3><div className="when-grid">{content.openWhen.map((x, i) => <button key={x.label} className={note === i ? 'active' : ''} onClick={() => setNote(i)}>✉ <span>{x.label}</span></button>)}</div><div className="when-message" role="status">{note === null ? 'Choose the note you need today.' : content.openWhen[note].message}</div></div>
      <div className="hope-card garden"><h3>The still-going garden</h3><p>Every little step counts. Plant one whenever you need to remember that.</p><div className="garden-bed" aria-label={`${blooms} flowers grown`}>{Array.from({ length: Math.min(blooms, 12) }, (_, i) => <Flower key={i} kind={i % 2 ? 'magnolia' : 'peony'} />)}</div><button className="primary" onClick={() => { bloom(); setAffirmation(x => (x + 1) % content.affirmations.length); }}>I'm still going ✿</button><p className="garden-affirmation">{content.affirmations[affirmation]}</p></div>
      <div className="hope-card breathe"><div className="breathing-flower"><Flower kind="magnolia" /></div><h3>One breath at a time</h3><p>Breathe in as the flower grows. Breathe out as it settles.</p><button className="soft-button" onClick={() => setAffirmation(x => (x + 1) % content.affirmations.length)}>Another gentle reminder</button><p role="status">{content.affirmations[affirmation]}</p></div>
    </div>
  </section>;
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
    <Nav active={active} /><main><Hero /><Gallery onPhoto={setLightbox} /><Us onPhoto={setLightbox} /><Letters /><Hope />
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
