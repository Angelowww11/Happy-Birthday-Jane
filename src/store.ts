import { create } from 'zustand';
type Theme = 'pink'|'yellow'|'blend';
type Saved = { theme: Theme; opened: boolean; letters: number[]; stickers: string[]; blooms: number; rsvp: boolean };
const initial: Saved = {theme:'blend',opened:false,letters:[],stickers:[],blooms:0,rsvp:false};
function read(): Saved { try { return {...initial,...JSON.parse(localStorage.getItem('jane-gift-v1') || '{}')}; } catch { return initial; } }
function save(s: Saved) { try { localStorage.setItem('jane-gift-v1',JSON.stringify(s)); } catch { /* browsing can be private */ } }
type State = Saved & { setTheme:(theme:Theme)=>void; open:()=>void; openLetter:(i:number)=>void; unlock:(id:string)=>void; bloom:()=>void; accept:()=>void; reset:()=>void };
export const useGift = create<State>((set)=>({
  ...read(),
  setTheme:(theme)=>set(s=>{const n={...s,theme};save(n);return n}),
  open:()=>set(s=>{const n={...s,opened:true};save(n);return n}),
  openLetter:(i)=>set(s=>{const n={...s,letters:[...new Set([...s.letters,i])]};save(n);return n}),
  unlock:(id)=>set(s=>{const n={...s,stickers:[...new Set([...s.stickers,id])]};save(n);return n}),
  bloom:()=>set(s=>{const n={...s,blooms:s.blooms+1};save(n);return n}),
  accept:()=>set(s=>{const n={...s,rsvp:true};save(n);return n}),
  reset:()=>set(()=>{save(initial);return initial})
}));
