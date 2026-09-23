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
  return <div className="brand-story" ref={root} id="craftsmanship">
    <section className="story-intro story-width" aria-labelledby="story-title" data-story-reveal>
      <p className="eyebrow">THE ART OF JEWELLERY</p>
      <h2 id="story-title">時間流轉，匠心留存。</h2>
      <p>以礦石商的眼光選材，以工匠的雙手賦形。<br/>將您珍視的獨特，化作腕間的珠寶。</p>
    </section>

    <section className="story-craft" id="handcraft" aria-labelledby="craft-title">
      <figure className="story-figure story-craft-image" data-story-reveal>
        <img src="/images/story/hand-setting.webp" width="1600" height="1075" loading="lazy" alt="工匠以鑷子逐顆放置寶石於金屬鑲座的 AI 工藝示意，非實際工坊紀錄"/>
        <figcaption>手工鑲嵌概念 · AI 示意，非實際工坊紀錄</figcaption>
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
        <img src="/images/story/mineral-selection.webp" width="1600" height="1075" loading="lazy" alt="原礦、綠色刻面寶石與選石工具的 AI 選材概念示意"/>
        <figcaption>選材概念 · AI 示意</figcaption>
      </figure>
      <div className="story-copy" data-story-reveal>
        <p className="story-index">A MINERAL MERCHANT’S EYE</p>
        <h2 id="mineral-title">懂得一顆石，<br/>才能讀懂它的光。</h2>
        <p>我們是礦石商。從色澤、光感到切面比例，細看每一份選材的可能；再以金工的線條與寶石的排列，寫下屬於您的設計。</p>
        <a href="#bespoke" className="story-chapter-link">從選石開始 <ArrowUpRight size={15}/></a>
      </div>
    </section>
  </div>;
}

const watchConcepts = [
  {shape:'圓形',english:'THE ROUND',name:'圓融，亦有鋒芒。',detail:'以柔和輪廓，襯托寶石與鏈節的節奏。'},
  {shape:'方形',english:'THE SQUARE',name:'俐落，自成風格。',detail:'以清晰線條，延伸金工與幾何的表情。'},
  {shape:'酒桶形',english:'THE TONNEAU',name:'曲線，恰如其分。',detail:'沿著錶型弧度，探索珠寶搭配的可能。'},
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
          <div className="bespoke-crop"><img src="/images/story/bespoke-watches.webp" width="1600" height="1075" loading="lazy" style={{transform:`translateX(-${shape*100/3}%)`}} alt={`${concept.shape}腕錶與珠寶錶帶的 AI 訂製概念示意，非現售款式`}/></div>
          <figcaption>AI 訂製概念示意 · 非現售款式</figcaption>
        </figure>
        <div className="bespoke-editorial-copy">
          <p className="story-index">{concept.english}</p>
          <div className="bespoke-concept-title" aria-live="polite"><h3>{concept.name}</h3><p>{concept.detail}</p></div>
          <div className="bespoke-shapes" role="group" aria-label="探索訂製錶型">{watchConcepts.map((item,index)=><button type="button" key={item.shape} aria-pressed={shape===index} onClick={()=>setShape(index)}>{item.shape}</button>)}</div>
          <p className="bespoke-consult-note">分享腕錶品牌、型號與尺寸，<br/>與我們討論選石、金工與專屬設計。</p>
          <button type="button" className="gold-button" onClick={onConsult}>預約訂製諮詢 <ArrowUpRight size={16}/></button>
          <p className="bespoke-qualification">實際結構、可製作範圍及報價，依您的錶款確認。</p>
        </div>
      </div>
    </section>
  </div>;
}
