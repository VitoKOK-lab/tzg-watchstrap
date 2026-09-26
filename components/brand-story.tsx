'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

function useStoryReveal() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || preference.matches || !('IntersectionObserver' in window)) return;
    const targets = element.querySelectorAll<HTMLElement>('[data-story-reveal]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.08});
    targets.forEach(target => observer.observe(target));
    element.classList.add('story-motion-ready');
    const showAll = () => {
      if (preference.matches) {
        element.classList.remove('story-motion-ready');
        observer.disconnect();
      }
    };
    preference.addEventListener('change', showAll);
    return () => {
      observer.disconnect();
      element.classList.remove('story-motion-ready');
      preference.removeEventListener('change', showAll);
    };
  }, []);
  return root;
}

export function BrandStory() {
  const root = useStoryReveal();
  const craftVideo = useRef<HTMLVideoElement>(null);
  const [craftFilmReveal,setCraftFilmReveal] = useState(false);
  const [craftFilmUnavailable,setCraftFilmUnavailable] = useState(false);
  useEffect(() => {
    const video = craftVideo.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.currentTime = 0;
        void video.play().catch(() => setCraftFilmUnavailable(true));
      } else {
        video.pause();
      }
    }, {threshold: 0.2});
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <div className="brand-story" ref={root} id="craftsmanship">
    <section className="story-intro story-width" aria-labelledby="story-title" data-story-reveal>
      <p className="eyebrow">THE ART OF JEWELLERY</p>
      <h2 id="story-title">時間流轉，匠心留存。</h2>
      <p>以礦石商的眼光選材，以工匠的雙手賦形。<br/>將您珍視的獨特，化作腕間的珠寶。</p>
    </section>

    <section className="story-craft" id="handcraft" aria-labelledby="craft-title">
      <figure className={`story-figure story-craft-image${craftFilmReveal?' is-revealing':''}`}>
        <picture className="story-film-poster">
          <source media="(max-width: 760px)" srcSet="/images/story/g852-7-atelier-poster-mobile.webp"/>
          <img src="/images/story/g852-7-atelier-poster.webp" width="1600" height="900" loading="lazy" alt="工匠檢視綠色方石並準備鑲嵌珠寶錶帶的工藝情境示意"/>
        </picture>
        {!craftFilmUnavailable && <video ref={craftVideo} muted playsInline preload="metadata" aria-label="工匠挑選綠色方石並逐顆鑲嵌綠境星河珠寶錶帶的無聲工藝意境短片" onTimeUpdate={event=>setCraftFilmReveal(event.currentTarget.currentTime>=4.4)} onError={()=>setCraftFilmUnavailable(true)}>
          <source src="/videos/g852-7-atelier-film-mobile.mp4" type="video/mp4" media="(max-width: 760px)"/>
          <source src="/videos/g852-7-atelier-film.mp4" type="video/mp4"/>
        </video>}
        <div className="story-film-copy story-film-craft-copy" aria-hidden="true"><span>ATELIER / STONE SELECTION</span><strong>選石，從光開始。</strong></div>
        <div className="story-film-copy story-film-product-copy" aria-hidden="true"><span>THE HUMAN TOUCH</span><strong>每一顆，親手鑲嵌。</strong><small>綠境星河 · G852-7</small></div>
        <figcaption>珠寶工藝情境示意 · 非實際工坊紀錄</figcaption>
      </figure>
      <div className="story-craft-heading story-width" data-story-reveal>
        <p className="story-index">THE HUMAN TOUCH</p>
        <h2 id="craft-title">一顆一顆，成就一件。</h2>
        <p>每一件皆由工匠手工製作。<br/>每一顆寶石，皆由工匠親手鑲嵌。</p>
        <a href="#bespoke" className="story-chapter-link">探索專屬訂製 <ArrowUpRight size={15}/></a>
      </div>
    </section>

    <section className="story-mineral story-width" aria-labelledby="mineral-title">
      <figure className="story-figure" data-story-reveal>
        <img src="/images/story/bespoke-strap-consultation.webp" width="1600" height="1195" loading="lazy" alt="展示寶石、設計草圖與錶帶樣品的私人珠寶錶帶訂製情境示意"/>
        <figcaption>珠寶錶帶訂製諮詢示意</figcaption>
      </figure>
      <div className="story-copy" data-story-reveal>
        <p className="story-index">A MINERAL MERCHANT’S EYE</p>
        <h2 id="mineral-title">懂得一顆石，<br/>才能讀懂它的光。</h2>
        <p>我們是礦石商。從色澤、光感到切面比例，與您細選每一顆寶石；再以金工線條與鑲嵌排列，為珍愛的腕錶訂製專屬珠寶錶帶。</p>
        <a href="#bespoke" className="story-chapter-link">探索珠寶錶帶訂製 <ArrowUpRight size={15}/></a>
      </div>
    </section>
  </div>;
}

const watchConcepts = [
  {shape:'Apple Watch',english:'APPLE WATCH',name:'為熟悉的日常，鑲上獨特光彩。',detail:'由錶帶接點、尺寸與金屬色出發，討論專屬寶石排列。',image:'/images/story/bespoke-apple-watch.webp',alt:'Apple Watch 錶殼與可拆換珠寶錶帶分開陳列，清楚展示滑軌式錶帶接點的訂製示意'},
  {shape:'AP 類型',english:'OCTAGONAL SPORTS WATCH',name:'俐落稜角，延伸珠寶的個性。',detail:'以可更換錶帶的八角形運動腕錶為例，依接點設計珠寶錶帶。',image:'/images/story/bespoke-ap-type.webp',alt:'八角形運動腕錶錶殼與可拆換寶石錶帶分開陳列，展示錶耳與錶帶接點的訂製示意'},
  {shape:'PP 類型',english:'ROUNDED SPORTS WATCH',name:'經典弧線，映出個人風格。',detail:'以可更換錶帶的圓角運動腕錶為例，依型號規劃選石與比例。',image:'/images/story/bespoke-pp-type.webp',alt:'圓角運動腕錶錶殼與可拆換寶石錶帶分開陳列，展示錶耳與錶帶接點的訂製示意'},
];

export function BespokeStory({onConsult}: {onConsult: () => void}) {
  const root = useStoryReveal();
  const [shape,setShape] = useState(0);
  const concept=watchConcepts[shape];
  return <div className="brand-story" ref={root}>
    <section className="story-bespoke" id="bespoke" aria-labelledby="bespoke-title">
      <div className="story-bespoke-heading story-width" data-story-reveal>
        <p className="story-index">BESPOKE CREATIONS</p>
        <h2 id="bespoke-title">為您而作，<br/>不止一種可能。</h2>
        <p>不只 Apple Watch。從您珍愛的腕錶出發，<br/>讓寶石、金屬與個人風格，有一場專屬的相遇。</p>
      </div>
      <div className="bespoke-editorial story-width" data-story-reveal>
        <figure className="story-figure story-bespoke-image">
          <img src={concept.image} width="1086" height="1448" loading="lazy" alt={concept.alt}/>
          <figcaption>珠寶錶帶訂製示意 · 實際依腕錶型號與需求確認</figcaption>
        </figure>
        <div className="bespoke-editorial-copy">
          <p className="story-index">{concept.english}</p>
          <div className="bespoke-concept-title" aria-live="polite"><h3>{concept.name}</h3><p>{concept.detail}</p></div>
          <div className="bespoke-shapes" role="group" aria-label="可更換錶帶的腕錶類型示意">{watchConcepts.map((item,index)=><button type="button" key={item.shape} aria-pressed={shape===index} onClick={()=>setShape(index)}>{item.shape}</button>)}</div>
          <p className="bespoke-consult-note">分享腕錶品牌、型號與尺寸，<br/>與我們討論選石、金工與專屬設計。</p>
          <button type="button" className="gold-button" onClick={onConsult}>預約訂製諮詢 <ArrowUpRight size={16}/></button>
          <p className="bespoke-qualification">實際結構、可製作範圍及報價，依您的錶款確認。</p>
        </div>
      </div>
    </section>
  </div>;
}
