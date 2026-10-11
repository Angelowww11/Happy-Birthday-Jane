import { useState } from 'react';
import type { Photo as PhotoType } from '../content/content';
export function Photo({photo,className='',eager=false,onClick}:{photo:PhotoType;className?:string;eager?:boolean;onClick?:()=>void}) {
  const [loaded,setLoaded]=useState(false);
  return <button type="button" onClick={onClick} className={`photo ${className}`} aria-label={`View photo: ${photo.alt}`}><span className="photo-image" style={{backgroundImage:photo.thumb?`url(${photo.thumb})`:undefined}}><img src={photo.src} alt={photo.alt} loading={eager?'eager':'lazy'} decoding="async" onLoad={()=>setLoaded(true)} className={loaded?'loaded':''} style={{objectPosition:photo.position||'center'}}/></span><span className="photo-caption">{photo.caption}</span></button>;
}
