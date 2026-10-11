import { useEffect, useState } from 'react';
import { content } from './content/content';

const target = new Date(`${content.dateNight}T00:00:00+08:00`).getTime();

export default function DateChapter() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = Math.max(0, target - now);
  const values = [
    ['days', Math.floor(left / 86_400_000)],
    ['hours', Math.floor(left / 3_600_000) % 24],
    ['minutes', Math.floor(left / 60_000) % 60],
    ['seconds', Math.floor(left / 1000) % 60],
  ] as const;
  const isTheDay = now >= target && now < target + 86_400_000;

  return (
    <section className="chapter date-chapter" id="date">
      <div className="date-shell">
        <div className="chapter-label">One more page for us ♡</div>
        <div className="date-ticket">
          <img className="date-flower" src="/assets/flowers/floral-corner.webp" alt="" aria-hidden="true" loading="lazy" />
          <div className="date-ticket-copy">
            <span className="date-ticket-top">♡ Please keep this day for us ♡</span>
            <div className="date-ticket-numeral">19<span>OCT</span></div>
            <p className="date-ticket-year">MONDAY · 2026</p>
            <h2>Our next<br/><em>little adventure.</em></h2>
            <p>{content.date.intro}</p>
            <span className="date-ticket-stamp">SAVE THE DATE ✿ SAVE THE DATE ✿</span>
          </div>
          <div className="date-ticket-photo">
            <img src={content.usPhotos[4]?.src} alt="Jane and Angelo together outside" loading="lazy" />
            <span>you + me, again ♡</span>
          </div>
          <img className="date-nailong" src="/assets/nailong/flower-sticker.webp" alt="" />
        </div>
        <div className="countdown-panel" aria-label="Countdown to October 19, 2026">
          <div><span className="kicker">The countdown</span><h3>{left ? 'Until I see you again' : isTheDay ? 'Today is our day ♡' : 'Another day for our story ♡'}</h3></div>
          {left > 0 && <div className="countdown-digits">{values.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>}
        </div>
        <p className="date-ending">I love you, Jane. That is the whole thing. ♡</p>
      </div>
    </section>
  );
}
