'use client';

import {useEffect,useRef,useState} from 'react';

/** The existing hero photo stays underneath, including when autoplay is unavailable. */
export function HeroIntro(){
  const videoRef=useRef<HTMLVideoElement>(null);
  const [playing,setPlaying]=useState(false);
  const finished=useRef(false);

  useEffect(()=>{
    const video=videoRef.current;
    if(!video||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    video.muted=true;
    void video.play().catch(()=>{
      // Keep the photo visible if the browser blocks muted autoplay.
    });
    return ()=>video.pause();
  },[]);

  function finish(){finished.current=true;setPlaying(false);}

  return <video
    ref={videoRef}
    className={`hero-intro${playing?' is-playing':''}`}
    src="/videos/hero-g852-intro.mp4"
    muted
    playsInline
    preload="none"
    aria-hidden="true"
    tabIndex={-1}
    onPlaying={()=>{if(!finished.current)setPlaying(true);}}
    onEnded={finish}
    onError={finish}
  />;
}
