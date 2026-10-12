import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { content } from './content/content';
import { useGift } from './store';

const gameInfo = [
  { id: 'petals', icon: '✿', name: 'Petal catch', blurb: 'Catch the good things' },
  { id: 'memory', icon: '▣', name: 'Our photo match', blurb: 'Find our moments' },
  { id: 'hop', icon: '♡', name: 'Nailong hop', blurb: 'Jump the clouds' },
  { id: 'puzzle', icon: '✧', name: 'Picture puzzle', blurb: 'Piece us together' },
  { id: 'scratch', icon: '★', name: 'Scratch notes', blurb: 'A surprise underneath' },
  { id: 'bouquet', icon: '❀', name: 'Make a bouquet', blurb: 'Pick flowers for us' },
  { id: 'words', icon: '✎', name: 'Love word hunt', blurb: 'Find our little words' },
] as const;
type GameId = typeof gameInfo[number]['id'];

function Win({ id, onReplay, message }: { id: GameId; onReplay: () => void; message: string }) {
  const unlocked = useGift(s => s.stickers.includes(id));
  return <div className="game-win" role="status"><span className="win-sparkle">✦ ✿ ✦</span><strong>{unlocked ? 'A little win for us!' : 'You did it!'}</strong><p>{message}</p><button className="primary" onClick={onReplay}>Play again ↗</button></div>;
}

function PetalCatch() {
  const unlock = useGift(s => s.unlock);
  const [running, setRunning] = useState(false), [score, setScore] = useState(0), [seconds, setSeconds] = useState(30);
  const [basket, setBasket] = useState(50), [petals, setPetals] = useState<{ id: number; x: number; y: number; gold: boolean }[]>([]);
  const id = useRef(0), petalsRef = useRef<typeof petals>([]), basketRef = useRef(50);
  const won = score >= 12, ended = seconds === 0 && !won;
  useEffect(() => {
    if (!running || won || ended) return;
    const timer = window.setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, won, ended]);
  useEffect(() => {
    if (!running || won || ended) return;
    const timer = window.setInterval(() => {
      const moved = petalsRef.current.map(p => ({ ...p, y: p.y + 3.8 }));
      let earned = 0;
      const left = moved.filter(p => {
        if (p.y >= 85 && p.y <= 95 && Math.abs(p.x - basketRef.current) < 13) { earned += p.gold ? 3 : 1; return false; }
        return p.y < 105;
      });
      if (earned) setScore(s => s + earned);
      if (Math.random() < .42) left.push({ id: id.current++, x: 8 + Math.random() * 84, y: -6, gold: Math.random() < .19 });
      petalsRef.current = left;
      setPetals(left);
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, won, ended]);
  useEffect(() => { if (won) { unlock('petals'); setRunning(false); } }, [won, unlock]);
  const restart = () => { petalsRef.current = []; setScore(0); setSeconds(30); setPetals([]); setRunning(true); };
  const move = (e: PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); const next = Math.max(9, Math.min(91, (e.clientX - r.left) / r.width * 100)); basketRef.current = next; setBasket(next); };
  return <div className="game-body"><div className="game-instructions"><h3>Petal catch</h3><p>Catch 12 points before the timer ends. Golden flowers are worth three. Drag the basket or use the arrow keys.</p></div>
    <div className="game-scorebar"><span>✿ {score} / 12</span><span>◷ {seconds}s</span></div>
    <div className="catch-field" tabIndex={0} onPointerDown={e => { move(e); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (e.buttons || e.pointerType === 'touch') move(e); }} onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const next = Math.max(9, Math.min(91, basketRef.current + (e.key === 'ArrowLeft' ? -7 : 7))); basketRef.current = next; setBasket(next); } }} aria-label="Petal catch. Drag or use arrow keys to move the basket.">
      <span className="field-cloud field-cloud-one">☁</span><span className="field-cloud field-cloud-two">☁</span>
      {petals.map(p => <span key={p.id} className={`falling-game-petal ${p.gold ? 'gold' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.gold ? '✦' : '✿'}</span>)}
      <span className="basket" style={{ left: `${basket}%` }}>♡</span>
    </div>
    {won ? <Win id="petals" onReplay={restart} message="A flower for every day you kept going. I notice all of them." /> : ended ? <div className="game-end"><p>So close! The flowers are still here for you.</p><button className="primary" onClick={restart}>Try again ↗</button></div> : <div className="game-actions"><button className="primary" onClick={() => setRunning(v => !v)}>{running ? 'Pause game' : score ? 'Keep catching' : 'Start catching'}</button><button className="text-link" onClick={restart}>Restart</button></div>}
  </div>;
}

function shuffleDeck() { const deck = [0, 1, 2, 3, 0, 1, 2, 3]; for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } return deck; }
function MemoryMatch() {
  const unlock = useGift(s => s.unlock), pics = content.usPhotos.slice(0, 4);
  const [deck, setDeck] = useState(shuffleDeck), [flipped, setFlipped] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0), [caption, setCaption] = useState('Tap any two cards to find a memory.');
  const busy = useRef(false);
  const won = matched.length === 4;
  useEffect(() => { if (won) unlock('memory'); }, [won, unlock]);
  function turn(i: number) {
    if (busy.current || flipped.includes(i) || matched.includes(deck[i])) return;
    const next = [...flipped, i]; setFlipped(next);
    if (next.length === 2) {
      busy.current = true; setMoves(n => n + 1);
      window.setTimeout(() => {
        if (deck[next[0]] === deck[next[1]]) { setMatched(old => [...old, deck[i]]); setCaption(pics[deck[i]].caption); }
        else setCaption('Not a pair yet. Try another two ♡');
        setFlipped([]); busy.current = false;
      }, 1050);
    }
  }
  const restart = () => { setDeck(shuffleDeck()); setFlipped([]); setMatched([]); setMoves(0); setCaption('Tap any two cards to find a memory.'); };
  return <div className="game-body"><div className="game-instructions"><h3>Our photo match</h3><p>Four photos, eight cards, and a few moments I never want to forget. Find the pairs to reveal their little notes.</p></div>
    <div className="game-scorebar"><span>♡ {matched.length} / 4 pairs</span><span>{moves} turns</span></div>
    <div className="memory-grid">{deck.map((v, i) => { const faceUp = flipped.includes(i) || matched.includes(v); return <button key={i} className={`memory-card ${faceUp ? 'flipped' : ''} ${matched.includes(v) ? 'matched' : ''}`} onClick={() => turn(i)} aria-label={faceUp ? pics[v].alt : `Hidden memory card ${i + 1}`} aria-pressed={faceUp}><span className="memory-card-inner"><span className="memory-card-back"><span>♡</span><small>our little moments</small></span><span className="memory-card-front"><img src={pics[v].src} alt="" loading="lazy" /><small>{pics[v].scene}</small></span></span></button>; })}</div>
    <div className="memory-caption" role="status">✉ {caption}</div>
    {won ? <Win id="memory" onReplay={restart} message="My favorite memories have you in them. More to come, baby." /> : <div className="game-actions"><button className="text-link" onClick={restart}>Shuffle and start over ↗</button></div>}
  </div>;
}

function DragonHop() {
  const unlock = useGift(s => s.unlock);
  const [running, setRunning] = useState(false), [score, setScore] = useState(0), [misses, setMisses] = useState(0), [jump, setJump] = useState(false), [feedback, setFeedback] = useState('Tap just as a cloud reaches the glowing ring!');
  const [clouds, setClouds] = useState<{ id: number; x: number }[]>([]), nextId = useRef(0), counted = useRef(new Set<number>());
  const cloudsRef = useRef<typeof clouds>([]), jumpRef = useRef(false), jumpTimer = useRef<number | undefined>(undefined);
  const won = score >= 6, ended = misses >= 6 && !won;
  useEffect(() => {
    if (!running || won || ended) return;
    const timer = window.setInterval(() => {
      const moved = cloudsRef.current.map(c => ({ ...c, x: c.x - (1.65 + score * .09) }));
      for (const cloud of moved) if (!counted.current.has(cloud.id)) {
        if (cloud.x <= 25 && cloud.x >= 10 && jumpRef.current) { counted.current.add(cloud.id); setScore(n => n + 1); setFeedback('Lovely hop! ✦'); }
        else if (cloud.x < 10) { counted.current.add(cloud.id); setMisses(n => n + 1); setFeedback('Almost! Wait for the glowing ring ♡'); }
      }
      const left = moved.filter(c => c.x >= -10);
      if (!left.length || left[left.length - 1].x < 42) left.push({ id: nextId.current++, x: 105 });
      cloudsRef.current = left;
      setClouds(left);
    }, 75);
    return () => window.clearInterval(timer);
  }, [running, won, ended, score]);
  useEffect(() => { if (won) { unlock('hop'); setRunning(false); } }, [won, unlock]);
  const jumpNow = () => { if (!running) return; window.clearTimeout(jumpTimer.current); jumpRef.current = true; setJump(true); jumpTimer.current = window.setTimeout(() => { jumpRef.current = false; setJump(false); }, 820); };
  const restart = () => { window.clearTimeout(jumpTimer.current); cloudsRef.current = []; jumpRef.current = false; setScore(0); setMisses(0); setClouds([]); counted.current.clear(); setJump(false); setFeedback('Tap just as a cloud reaches the glowing ring!'); setRunning(true); };
  return <div className="game-body"><div className="game-instructions"><h3>Nailong hop</h3><p>Help our little yellow friend hop over six clouds. Tap the stage, hit Space, or press Hop when a cloud gets close.</p></div>
    <div className="game-scorebar"><span>♡ {score} / 6 hops</span><span>{Math.max(0, 6 - misses)} chances left</span></div>
    <div className="hop-field" tabIndex={0} onPointerDown={jumpNow} onKeyDown={e => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jumpNow(); } }} aria-label="Nailong hop. Tap or press Space to jump over clouds.">
      <span className="hop-sun">✦</span><span className="hop-sky-cloud cloud-a">☁</span><span className="hop-sky-cloud cloud-b">☁</span><span className="hop-hills"/><span className="hop-target"><span>HOP<br/>HERE</span></span><img className={`hop-buddy ${jump ? 'jump' : ''}`} src={content.nailongAsset} alt="" />
      {clouds.map(c => <span key={c.id} className="hop-cloud" style={{ left: `${c.x}%` }}>☁</span>)}<span className="hop-ground" /><span className="hop-flowers">✿ · ✿ · ✿ · ✿</span>
    </div>
    <p className="hop-feedback" role="status" key={feedback}>{feedback}</p>
    {won ? <Win id="hop" onReplay={restart} message="You make ordinary days feel lighter. Even the cloudy ones." /> : ended ? <div className="game-end"><p>Those clouds were tricky! Nailong wants another try.</p><button className="primary" onClick={restart}>Hop again ↗</button></div> : <div className="game-actions"><button className="primary" onClick={() => setRunning(v => !v)}>{running ? 'Pause game' : score || misses ? 'Keep hopping' : 'Start hopping'}</button><button className="soft-button" onClick={jumpNow}>Hop! ↑</button><button className="text-link" onClick={restart}>Restart</button></div>}
  </div>;
}

function shuffledPuzzle() {
  const a = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = 0; i < 45; i++) {
    const blank = a.indexOf(8);
    const neighbors = [blank - 3, blank + 3, blank % 3 ? blank - 1 : -1, blank % 3 < 2 ? blank + 1 : -1].filter(n => n >= 0 && n < 9);
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    [a[blank], a[next]] = [a[next], a[blank]];
  }
  return a;
}
function PhotoPuzzle() {
  const unlock = useGift(s => s.unlock), pic = { ...content.usPhotos[4], src: '/photos/us/us-5-puzzle.webp' };
  const [tiles, setTiles] = useState(shuffledPuzzle), [peek, setPeek] = useState(false), [moves, setMoves] = useState(0);
  const won = tiles.every((n, i) => n === i);
  useEffect(() => { if (won) unlock('puzzle'); }, [won, unlock]);
  function move(i: number) {
    const blank = tiles.indexOf(8);
    if (Math.abs(Math.floor(blank / 3) - Math.floor(i / 3)) + Math.abs(blank % 3 - i % 3) !== 1) return;
    setTiles(old => { const next = [...old]; [next[i], next[blank]] = [next[blank], next[i]]; return next; });
    setMoves(n => n + 1);
  }
  const restart = () => { setTiles(shuffledPuzzle()); setMoves(0); setPeek(false); };
  return <div className="game-body"><div className="game-instructions"><h3>Picture puzzle</h3><p>Slide the tiles into the empty space to bring our photo back together. Peek as often as you like.</p></div>
    <div className="game-scorebar"><span>✧ {moves} moves</span><span>3 × 3 pieces</span></div>
    <div className="puzzle-wrap"><div className="puzzle-grid">{tiles.map((tile, i) => <button key={i} className={`puzzle-tile ${tile === 8 ? 'empty' : ''}`} onClick={() => move(i)} aria-label={tile === 8 ? 'Empty space' : `Move photo tile ${tile + 1}`} style={tile !== 8 ? { backgroundImage: `url(${pic.src})`, backgroundPosition: `${tile % 3 * 50}% ${Math.floor(tile / 3) * 50}%` } : undefined} />)}</div>{peek && <div className="puzzle-peek"><img src={pic.src} alt={pic.alt} /></div>}</div>
    {won ? <Win id="puzzle" onReplay={restart} message="Every piece led me to you. I would choose this picture again." /> : <div className="game-actions"><button className="soft-button" onClick={() => setPeek(v => !v)}>{peek ? 'Hide photo' : 'Peek at photo'}</button><button className="text-link" onClick={restart}>Mix the pieces ↗</button></div>}
  </div>;
}

function ScratchCard() {
  const unlock = useGift(s => s.unlock);
  const [index, setIndex] = useState(0), [revealed, setRevealed] = useState(false), [progress, setProgress] = useState(0), canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false), strokes = useRef(0), last = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const element = canvas.current, ctx = element?.getContext('2d'); if (!element || !ctx) return;
    const ratio = window.devicePixelRatio || 1; element.width = 420 * ratio; element.height = 210 * ratio; ctx.scale(ratio, ratio);
    ctx.fillStyle = '#f07aa9'; ctx.fillRect(0, 0, 420, 210);
    ctx.fillStyle = '#fff5cd'; ctx.font = 'bold 32px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('scratch here ♡', 210, 115);
    strokes.current = 0; last.current = null; setRevealed(false); setProgress(0);
  }, [index]);
  function scratch(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || revealed) return;
    const el = canvas.current, ctx = el?.getContext('2d'); if (!el || !ctx) return;
    const r = el.getBoundingClientRect(), point = { x: (e.clientX - r.left) / r.width * 420, y: (e.clientY - r.top) / r.height * 210 };
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(last.current?.x ?? point.x, last.current?.y ?? point.y); ctx.lineTo(point.x, point.y); ctx.stroke(); last.current = point;
    if (++strokes.current % 3 === 0) {
      const pixels = ctx.getImageData(0, 0, el.width, el.height).data; let clear = 0, total = 0;
      for (let y = 8; y < el.height; y += 14) for (let x = 8; x < el.width; x += 14) { total++; if (pixels[(y * el.width + x) * 4 + 3] < 30) clear++; }
      const amount = Math.round(clear / total * 100); setProgress(amount);
      if (amount >= 62) { setRevealed(true); unlock('scratch'); }
    }
  }
  const next = () => { if (revealed) setIndex(n => (n + 1) % content.scratch.length); };
  return <div className="game-body"><div className="game-instructions"><h3>Scratch notes</h3><p>There are twelve reasons underneath these cards. Drag your finger or mouse across the pink to reveal one.</p></div>
    <div className="game-scorebar"><span>★ REASON {index + 1} / {content.scratch.length}</span><span>made for Jane</span></div>
    <div className="scratch-card"><span>{content.scratch[index]}</span>{!revealed && <canvas ref={canvas} onPointerDown={e => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }} onPointerMove={scratch} onPointerUp={() => { drawing.current = false; last.current = null; }} onPointerCancel={() => { drawing.current = false; last.current = null; }} aria-label="Scratch most of the pink surface to reveal a reason I love you" />}</div>
    <div className="scratch-progress"><span style={{ width: `${progress}%` }} /><small>{revealed ? 'A little note, just for you ♡' : `${progress}% scratched · keep going!`}</small></div>
    <div className="game-actions"><button className="soft-button" disabled={!revealed} onClick={next}>Next reason ↗</button></div>
  </div>;
}

const bouquetFlowers = [
  { name: 'Blush bloom', src: '/assets/flowers/peony.webp', note: 'for the way you make me smile' },
  { name: 'Ivory bloom', src: '/assets/flowers/magnolia.webp', note: 'for the gentleness you share' },
  { name: 'Sunshine', src: '/assets/nailong/flower-sticker.webp', note: 'for the laughs we share' },
] as const;
function BouquetBuilder() {
  const unlock = useGift(s => s.unlock);
  const [flowers, setFlowers] = useState<number[]>([]), [wrapped, setWrapped] = useState(false);
  const canWrap = flowers.length === 5 && flowers.includes(0) && flowers.includes(1);
  const restart = () => { setFlowers([]); setWrapped(false); };
  return <div className="game-body bouquet-game"><div className="game-instructions"><h3>Make a bouquet</h3><p>Pick five blooms for us. Choose at least one pink and one ivory, then tie them together.</p></div>
    <div className="game-scorebar"><span>✿ {flowers.length} / 5 blooms</span><span>{canWrap ? 'Ready to wrap ♡' : 'Pink + ivory, please'}</span></div>
    <div className={`bouquet-vase ${wrapped ? 'wrapped' : ''}`} aria-label={`${flowers.length} flowers in bouquet`}><span className="bouquet-glow"/><span className="bouquet-ribbon">♡</span>{flowers.map((flower, i) => <img key={i} className={`bouquet-bloom bouquet-bloom-${i}`} src={bouquetFlowers[flower].src} alt={bouquetFlowers[flower].name} />)}<span className="bouquet-paper"/><span className="bouquet-ground"/><small>{flowers.length ? 'a bouquet made by Jane ♡' : 'your bouquet starts here ✿'}</small></div>
    <div className="bouquet-choices">{bouquetFlowers.map((flower, i) => <button key={flower.name} onClick={() => setFlowers(old => old.length < 5 && !wrapped ? [...old, i] : old)} disabled={flowers.length >= 5 || wrapped}><img src={flower.src} alt=""/><span><strong>{flower.name}</strong><small>{flower.note}</small></span><b>+</b></button>)}</div>
    {wrapped ? <Win id="bouquet" onReplay={restart} message="A little bouquet for the person who makes my days brighter. I love you, baby." /> : <div className="game-actions"><button className="primary" disabled={!canWrap} onClick={() => { setWrapped(true); unlock('bouquet'); }}>Tie the ribbon ♡</button><button className="text-link" disabled={!flowers.length} onClick={() => setFlowers(old => old.slice(0, -1))}>Undo last flower</button></div>}
  </div>;
}

const hiddenWords = ['JANE', 'LOVE', 'HOME', 'ALWAYS', 'SMILE'];
type WordBoard = { cells: string[]; paths: Record<string, number[]> };
function makeWordBoard(): WordBoard {
  const size = 8, cells = Array<string>(size * size).fill(''), paths: Record<string, number[]> = {};
  for (const word of ['ALWAYS', 'SMILE', 'LOVE', 'HOME', 'JANE']) {
    let placed = false;
    for (let attempt = 0; attempt < 500 && !placed; attempt++) {
      const x = Math.floor(Math.random() * size), y = Math.floor(Math.random() * size);
      const [dx, dy] = [[1, 0], [0, 1], [1, 1], [-1, 1]][Math.floor(Math.random() * 4)];
      const path = [...word].map((_, n) => (y + n * dy) * size + x + n * dx);
      if (path.some((at, n) => x + n * dx < 0 || x + n * dx >= size || y + n * dy >= size || (cells[at] && cells[at] !== word[n]))) continue;
      path.forEach((at, n) => { cells[at] = word[n]; }); paths[word] = path; placed = true;
    }
    if (!placed) return makeWordBoard();
  }
  const alphabet = 'ABCDEFGHIKLMNOPRSTUVWY';
  return { cells: cells.map(c => c || alphabet[Math.floor(Math.random() * alphabet.length)]), paths };
}
function WordHunt() {
  const unlock = useGift(s => s.unlock);
  const [board, setBoard] = useState(makeWordBoard), [picked, setPicked] = useState<number[]>([]), [found, setFound] = useState<string[]>([]), [message, setMessage] = useState('Find the little words across, down, or diagonally.');
  const won = found.length === hiddenWords.length;
  function pick(i: number) {
    if (won) return;
    const last = picked[picked.length - 1], stepX = last === undefined ? 0 : i % 8 - last % 8, stepY = last === undefined ? 0 : Math.floor(i / 8) - Math.floor(last / 8);
    const adjacent = last === undefined || (Math.abs(stepX) <= 1 && Math.abs(stepY) <= 1 && (stepX !== 0 || stepY !== 0));
    const previousStep = picked.length < 2 ? null : [picked[1] % 8 - picked[0] % 8, Math.floor(picked[1] / 8) - Math.floor(picked[0] / 8)];
    const straight = previousStep === null || (stepX === previousStep[0] && stepY === previousStep[1]);
    const next = adjacent && straight ? [...picked, i] : [i];
    const letters = next.map(n => board.cells[n]).join('');
    const match = hiddenWords.find(w => w === letters && !found.includes(w));
    if (match) { const updated = [...found, match]; setFound(updated); setPicked([]); setMessage(`${match} found! ${updated.length} of ${hiddenWords.length} little words ♡`); if (updated.length === hiddenWords.length) unlock('words'); }
    else if (hiddenWords.some(w => !found.includes(w) && w.startsWith(letters))) { setPicked(next); setMessage(`${letters}... keep going!`); }
    else { const solo = board.cells[i]; setPicked(hiddenWords.some(w => !found.includes(w) && w.startsWith(solo)) ? [i] : []); setMessage('Try a neighboring letter in a straight line ♡'); }
  }
  const restart = () => { setBoard(makeWordBoard()); setPicked([]); setFound([]); setMessage('Find the little words across, down, or diagonally.'); };
  return <div className="game-body words-game"><div className="game-instructions"><h3>Love word hunt</h3><p>Find five words tucked into this little page. Tap neighboring letters in a straight line: across, down, or diagonally.</p></div>
    <div className="game-scorebar"><span>✎ {found.length} / 5 found</span><span>Across · down · diagonal</span></div>
    <div className="word-targets">{hiddenWords.map(word => <span key={word} className={found.includes(word) ? 'found' : ''}>{found.includes(word) ? '✿ ' : '♡ '}{word}</span>)}</div>
    <div className="word-board" role="group" aria-label="Love word hunt letter grid">{board.cells.map((letter, i) => <button key={i} className={`${picked.includes(i) ? 'picked' : ''} ${found.some(w => board.paths[w].includes(i)) ? 'found' : ''}`} onClick={() => pick(i)} aria-label={`Row ${Math.floor(i / 8) + 1}, column ${i % 8 + 1}, ${letter}`}>{letter}</button>)}</div>
    <p className="word-message" role="status">{message}</p>
    {won ? <Win id="words" onReplay={restart} message="Jane, love, home, always, smile. Five tiny words, and you are my favorite part of them all." /> : <div className="game-actions"><button className="text-link" onClick={restart}>Start the hunt again ↗</button></div>}
  </div>;
}

export default function Games() {
  const [active, setActive] = useState<GameId>('memory');
  const stickers = useGift(s => s.stickers);
  const games: Record<GameId, ReactNode> = { petals: <PetalCatch />, memory: <MemoryMatch />, hop: <DragonHop />, puzzle: <PhotoPuzzle />, scratch: <ScratchCard />, bouquet: <BouquetBuilder />, words: <WordHunt /> };
  return <section className="chapter arcade-chapter" id="arcade"><img className="section-flower arcade-flower" src="/assets/flowers/peony.webp" alt="" aria-hidden="true" /><img className="floral-sweep arcade-sweep" src="/assets/flowers/birthday-sweep.webp" alt="" aria-hidden="true" /><div className="chapter-label">Come play with me ♡</div><div className="arcade-heading"><div><span className="kicker">A little silly, a little us</span><h2>Let's <em>play.</em></h2><p>Pick a game. Every little win adds a sticker to our collection.</p></div><img src="/assets/nailong/flower-sticker.webp" alt="" /></div>
    <div className="arcade-layout"><div className="arcade-sidebar"><div className="arcade-menu-label">CHOOSE A GAME ↓</div>{gameInfo.map(game => <button className={`arcade-tab ${active === game.id ? 'active' : ''}`} key={game.id} onClick={() => setActive(game.id)} aria-pressed={active === game.id}><span className="arcade-tab-icon">{game.icon}</span><span><strong>{game.name}</strong><small>{game.blurb}</small></span><b>{stickers.includes(game.id) ? '✓' : '↗'}</b></button>)}<div className="collection"><div><span className="kicker">Our sticker book</span><strong>{stickers.filter(id => gameInfo.some(game => game.id === id)).length} / 7</strong></div><div className="sticker-row">{gameInfo.map(game => <span key={game.id} className={stickers.includes(game.id) ? 'found' : ''}>{stickers.includes(game.id) ? game.icon : '♡'}</span>)}</div></div></div>
      <div className="arcade-stage" key={active}>{games[active]}</div>
    </div>
  </section>;
}
