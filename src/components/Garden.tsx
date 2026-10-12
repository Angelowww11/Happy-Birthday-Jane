import { useState } from 'react';
import confetti from 'canvas-confetti';

type Seed = 'blush' | 'ivory' | 'sunny';
type Plot = { seed: Seed; stage: 'sprout' | 'bud' | 'bloom' } | null;

const choices: { id: Seed; label: string; image: string }[] = [
  { id: 'blush', label: 'Blush', image: '/assets/flowers/peony.webp' },
  { id: 'ivory', label: 'Ivory', image: '/assets/flowers/magnolia.webp' },
  { id: 'sunny', label: 'Sunny', image: '/assets/flowers/sunny-bloom.svg' },
];
const emptyPlots = (): Plot[] => [null, null, null, null];
const firstNote = 'Nothing planted yet. Pick a color, then tap one of the little patches.';
const flowerNotes = [
  'I like how you keep trying, baby. I notice it.',
  'I wish I could hand you real flowers today.',
  'Even the little things feel better when I get to share them with you.',
  'I want us to have many more days to grow together.',
];

export function Garden() {
  const [plots, setPlots] = useState<Plot[]>(emptyPlots);
  const [selected, setSelected] = useState<Seed>('blush');
  const [note, setNote] = useState(firstNote);
  const [waterPulse, setWaterPulse] = useState(0);
  const grown = plots.filter(plot => plot?.stage === 'bloom').length;
  const seedlings = plots.some(plot => plot && plot.stage !== 'bloom');
  const complete = grown === plots.length;

  function showGrowth(next: Plot[], index?: number) {
    setPlots(next);
    setWaterPulse(pulse => pulse + 1);
    if (next.every(plot => plot?.stage === 'bloom')) {
      setNote('I wish I could hand you this little garden for real, baby. For now, it is all yours. ♡');
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({ particleCount: 65, spread: 70, origin: { y: .67 }, colors: ['#f4a6c4', '#ffe08a', '#fff8ef', '#bfd69e'] });
      }
    } else {
      setNote(index === undefined ? next.some(plot => plot?.stage === 'bloom') ? 'Look at them bloom! Tap a flower to read its note.' : 'Little buds! One more splash will help them bloom.' : next[index]?.stage === 'bloom' ? flowerNotes[index] : 'A little bud! One more splash will help it bloom.');
    }
  }

  function touchPlot(index: number) {
    const plot = plots[index];
    if (!plot) {
      const next = [...plots];
      next[index] = { seed: selected, stage: 'sprout' };
      setPlots(next);
      setNote('A little seed is in. Give it a splash to see what grows.');
    } else if (plot.stage !== 'bloom') {
      const next = [...plots];
      next[index] = { ...plot, stage: plot.stage === 'sprout' ? 'bud' : 'bloom' };
      showGrowth(next, index);
    } else {
      setNote(flowerNotes[index]);
    }
  }

  function waterAll() {
    if (!seedlings) return;
    showGrowth(plots.map(plot => plot ? { ...plot, stage: plot.stage === 'sprout' ? 'bud' : 'bloom' } : null));
  }

  function reset() {
    setPlots(emptyPlots());
    setNote(firstNote);
    setWaterPulse(0);
  }

  return <div className="hope-card garden">
    <div className="garden-heading"><div><span className="garden-eyebrow">a little space for you ♡</span><h3>The still-going garden</h3></div><span className="garden-count">{grown} / {plots.length}<small>blooms</small></span></div>
    <p>Pick a color, plant a little seed, and watch what happens when you give it some care.</p>
    <div className="garden-seeds" role="group" aria-label="Choose a flower color">{choices.map(choice => <button key={choice.id} type="button" className={`garden-seed-option ${choice.id} ${selected === choice.id ? 'selected' : ''}`} aria-pressed={selected === choice.id} onClick={() => setSelected(choice.id)}><img src={choice.image} alt="" /><span>{choice.label}</span></button>)}</div>
    <div className="garden-scene" aria-label={`${grown} of ${plots.length} flowers blooming`}>
      <span className="garden-sun" aria-hidden="true">✦</span><span className="garden-cloud garden-cloud-one" aria-hidden="true"/><span className="garden-cloud garden-cloud-two" aria-hidden="true"/><span className="garden-hills" aria-hidden="true"/><span className="garden-soil" aria-hidden="true"/>
      {waterPulse > 0 && <div className="garden-rain" key={waterPulse} aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <span key={i} style={{ left: `${7 + i * 7}%`, animationDelay: `${i * .055}s` }} />)}</div>}
      <div className="garden-plots">{plots.map((plot, index) => <button key={index} type="button" className={`garden-plot ${plot ? `is-${plot.stage}` : 'is-empty'} ${plot?.seed || ''}`} aria-label={plot ? plot.stage === 'bloom' ? `Flower ${index + 1}: hear its note` : `${plot.stage === 'bud' ? 'Bud' : 'Seedling'} ${index + 1}: give it care` : `Empty patch ${index + 1}: plant ${selected} seed`} onClick={() => touchPlot(index)}>
        <span className="garden-plot-soil" aria-hidden="true"/>
        {!plot ? <span className="garden-plant-here" aria-hidden="true">+</span> : plot.stage === 'bloom' ? <img className="garden-grown-flower" src={choices.find(choice => choice.id === plot.seed)!.image} alt="" style={{ animationDelay: `${index * .13}s` }} /> : <span className="garden-sprout" aria-hidden="true"><i/><b/><em/></span>}
      </button>)}</div>
    </div>
    <div className="garden-bottom"><div className="garden-progress" role="progressbar" aria-valuemin={0} aria-valuemax={plots.length} aria-valuenow={grown} aria-label="Garden blooms"><span style={{ width: `${grown / plots.length * 100}%` }}/></div><div className="garden-actions"><button className="primary garden-water" disabled={!seedlings} onClick={waterAll}>Water the garden <span aria-hidden="true">◌</span></button><button className="text-link" onClick={reset}>{complete ? 'Grow another garden ↺' : 'Start fresh ↺'}</button></div><p className="garden-note" role="status">{note}</p></div>
  </div>;
}
