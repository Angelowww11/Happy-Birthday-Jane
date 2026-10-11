import { content } from '../content/content';

export function Flower({ kind = 'peony', className = '' }: { kind?: 'peony' | 'magnolia'; className?: string }) {
  return <img className={`flower-art ${className}`} src={`/assets/flowers/${kind}.webp`} alt="" aria-hidden="true" loading="lazy" />;
}

export function Buddy({ onClick }: { onClick?: () => void }) {
  return <button className="buddy has-asset" aria-label="Nailong, the little yellow buddy" onClick={onClick}>
    <img src={content.nailongAsset} alt="" /><small>say hi ♡</small>
  </button>;
}
