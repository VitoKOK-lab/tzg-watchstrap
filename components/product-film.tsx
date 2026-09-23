'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowRight, Pause, Play, RotateCcw} from 'lucide-react';

export function ProductFilm({onExplore}: {onExplore: () => void}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let started = false;
    const observer = new IntersectionObserver(entries => {
      const inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .45;
      if (!inView) player.pause();
      else if (!started && !preference.matches) {
        started = true;
        void player.play().catch(() => { /* Manual play remains available. */ });
      }
    }, {threshold: [0, .45]});
    observer.observe(player);
    const pauseForPreference = () => { if (preference.matches) player.pause(); };
    preference.addEventListener('change', pauseForPreference);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', pauseForPreference);
      player.pause();
    };
  }, []);

  async function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (!player.paused) { player.pause(); return; }
    if (failed) { setFailed(false); player.load(); }
    if (player.ended) player.currentTime = 0;
    try { await player.play(); } catch { setFailed(true); }
  }

  return <section className="product-film story-width" aria-labelledby="film-title">
    <div className="product-film-copy">
      <p className="story-index">G852-7 / IN THE LIGHT</p>
      <h2 id="film-title">靠近一點，<br/>看見光的細節。</h2>
      <p>綠境星河。<br/>從深綠長方石的排列，到邊緣細緻的光芒，<br className="desktop-break"/>讓目光沿著珠寶的線條，慢慢停留。</p>
      <button type="button" className="text-link" onClick={onExplore}>探索綠境星河 <ArrowRight size={17}/></button>
    </div>
    <div className="product-film-gallery">
      <div className="product-film-stage">
        <img src="/images/green-retouched.webp" width="1254" height="1254" loading="lazy" alt="綠境星河珠寶錶帶與獨立錶殼白底圖"/>
        <video ref={video} src="/videos/green-launch.mp4" poster="/images/green-retouched.webp" muted playsInline preload="none" aria-label="綠境星河無聲 AI 動態示意" className={failed?'film-unavailable':''} onPlay={()=>{setPlaying(true);setEnded(false);}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);setEnded(true);}} onError={()=>{setFailed(true);setPlaying(false);}}/>
      </div>
      <div className="product-film-controls">
        <p>AI 動態示意 <span>· 10 秒 · 無聲</span></p>
        <button type="button" onClick={togglePlayback} aria-label={playing?'暫停綠境星河短片':ended?'重播綠境星河短片':'播放綠境星河短片'}>{playing?<Pause size={16}/>:ended?<RotateCcw size={16}/>:<Play size={16}/>}<span>{playing?'暫停':ended?'重播':failed?'重試播放':'播放'}</span></button>
      </div>
      {failed&&<p className="product-film-error" role="status">影片暫時無法播放，您仍可查看商品照片。</p>}
      <p className="product-film-note">以商品照片製作的動態示意；實際外觀請參考下方實物影片。配件不含 Apple Watch 主機。</p>
    </div>
  </section>;
}
