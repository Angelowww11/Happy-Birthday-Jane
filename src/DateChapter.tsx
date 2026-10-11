import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { content } from './content/content';
import { useGift } from './store';
import { Flower } from './components/Flower';
const target = new Date('2026-10-18T00:00:00+08:00').getTime();
function calendar() {
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Jane Birthday Gift//EN','BEGIN:VEVENT','UID:jane-date-20261018@birthday-gift','DTSTAMP:20261012T000000Z','DTSTART;VALUE=DATE:20261018','DTEND;VALUE=DATE:20261019','SUMMARY:A date with Angelo','DESCRIPTION:Time and place to decide together.','END:VEVENT','END:VCALENDAR'];
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar'}));const a=document.createElement('a');a.href=url;a.download='our-date-october-18.ics';a.click();URL.revokeObjectURL(url);
}
export default function DateChapter(){
  const [now,setNow]=useState(Date.now()); const [checked,setChecked]=useState<number[]>([]);const [shy,setShy]=useState(0);
  const accepted=useGift(s=>s.rsvp),accept=useGift(s=>s.accept);
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);
  const remaining=Math.max(0,target-now);const days=Math.floor(remaining/86400000),hours=Math.floor(remaining/3600000)%24,minutes=Math.floor(remaining/60000)%60,seconds=Math.floor(remaining/1000)%60;
  const onDay=now>=target&&now<target+86400000;
  return <section className="chapter date-chapter" id="date"><div className="chapter-label">Chapter seven / a day for us</div><div className="date-grid"><div className="invitation"><Flower kind="magnolia" className="invite-flower"/><span className="kicker">An invitation, just for you</span><h2>{content.date.title}</h2><p>{content.date.intro}</p><div className="countdown" aria-live="off">{remaining>0?<><span><strong>{days}</strong> days</span><span><strong>{hours}</strong> hours</span><span><strong>{minutes}</strong> min</span><span><strong>{seconds}</strong> sec</span></>:<p>{onDay?'Today is our day. I cannot wait to see you.':'That was lovely. Here is to more days together.'}</p>}</div><div className="date-facts"><p><b>When</b>{content.date.time}</p><p><b>Where</b>{content.date.place}</p><p><b>Wear</b>{content.date.dress}</p><p><b>Bring</b>{content.date.bring}</p></div><button className="text-link" onClick={calendar}>Add a tentative all-day reminder ↗</button></div><div className="date-side"><div className="paper-card"><span className="kicker">Our tiny plan</span><ol>{content.date.itinerary.map(x=><li key={x}>{x}</li>)}</ol><p>{content.date.plan}</p></div><div className="paper-card"><span className="kicker">Before we go</span>{content.date.checklist.map((x,i)=><label className="check-row" key={x}><input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i])}/>{x}</label>)}</div><div className="rsvp">{accepted?<p className="yes-message">It's a date, baby. ♡</p>:<><p>Will you come with me?</p><button className="primary" onClick={()=>{accept();confetti({particleCount:100,spread:75,colors:['#e9a0b8','#f6d66b','#fff3e2']})}}>Yes, obviously</button><button className="shy-button" style={{transform:`translate(${shy%2?18:-18}px,${shy%3?8:-8}px)`}} onPointerEnter={()=>setShy(x=>x+1)} onClick={()=>{if(shy>=3){accept();confetti({particleCount:80,spread:75})}else setShy(x=>x+1)}}>No? 👀</button></>}</div></div></div></section>
}
