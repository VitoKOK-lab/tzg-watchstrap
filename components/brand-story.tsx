'use client';

import {useEffect, useRef} from 'react';
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
      <p className="eyebrow">FROM STONE TO STORY</p>
      <h2 id="story-title">真正的奢華，<br/>從一顆寶石開始。</h2>
      <p>我們是礦石商，也是將珠寶帶入腕間的創作者。<br className="desktop-break"/>從選石的眼光，到手工的溫度，為每一份獨特而作。</p>
      <a href="#handcraft" className="story-chapter-link">探索手工的細節 <span aria-hidden="true">↓</span></a>
    </section>

    <section className="story-mineral story-width" aria-labelledby="mineral-title">
      <figure className="story-figure" data-story-reveal>
        <img src="/images/story/mineral-selection.webp" width="1600" height="1075" loading="lazy" alt="原礦、綠色刻面寶石與選石工具的 AI 選材概念示意"/>
        <figcaption>選材概念 · AI 示意</figcaption>
      </figure>
      <div className="story-copy" data-story-reveal>
        <p className="story-index">01 / 礦石商的選石眼光</p>
        <h2 id="mineral-title">先懂寶石，<br/>再談珠寶。</h2>
        <p>色澤、光感、切面與排列，每一項選擇，都影響作品的表情。我們從礦石與寶石出發，與您討論適合的選材，讓珠寶呼應您的品味。</p>
        <div className="story-detail-line"><span>選石</span><i/><span>配色</span><i/><span>整體設計</span></div>
      </div>
    </section>

    <section className="story-craft story-width" id="handcraft" aria-labelledby="craft-title">
      <div className="story-craft-heading" data-story-reveal>
        <div><p className="story-index">02 / 手工金工・逐顆鑲嵌</p><h2 id="craft-title">一顆一顆，<br/>鑲入工匠的心意。</h2></div>
        <p>每一件皆由工匠手工製作。<br/>每一顆寶石，皆由工匠親手鑲嵌。<br/><span>讓細節，成為值得靠近欣賞的理由。</span></p>
      </div>
      <figure className="story-figure story-craft-image" data-story-reveal>
        <img src="/images/story/hand-setting.webp" width="1600" height="1075" loading="lazy" alt="工匠以鑷子逐顆放置寶石於金屬鑲座的 AI 工藝示意，非實際工坊紀錄"/>
        <figcaption>手工鑲嵌概念 · AI 示意，非實際工坊紀錄</figcaption>
      </figure>
      <div className="story-craft-details" data-story-reveal>
        <div><span>01</span><h3>選石的秩序</h3><p>以色彩與比例，安排每一顆寶石在作品中的位置。</p></div>
        <div><span>02</span><h3>金工的線條</h3><p>讓金屬輪廓、鏈節與鑲座，承接您想表達的風格。</p></div>
        <div><span>03</span><h3>手工的溫度</h3><p>寶石逐顆手工鑲嵌，將心意落實在細節之間。</p></div>
      </div>
    </section>
  </div>;
}

export function BespokeStory({onConsult}: {onConsult: () => void}) {
  const root = useStoryReveal();
  return <div className="brand-story" ref={root}>
    <section className="story-bespoke story-width" id="bespoke" aria-labelledby="bespoke-title">
      <div className="story-bespoke-heading" data-story-reveal>
        <p className="story-index">03 / 為您的腕錶而作</p>
        <h2 id="bespoke-title">不只 Apple Watch。<br/>為您的腕錶而作。</h2>
        <p>圓形、方形、酒桶形；經典、俐落，或大膽鮮明。<br className="desktop-break"/>我們也承接其他錶型的錶帶與珠寶搭配訂製，從您的腕錶與想法開始。</p>
      </div>
      <figure className="story-figure story-bespoke-image" data-story-reveal>
        <img src="/images/story/bespoke-watches.webp" width="1600" height="1075" loading="lazy" alt="圓形、方形及酒桶形腕錶搭配不同珠寶錶帶的 AI 訂製概念示意"/>
        <figcaption>錶型與珠寶搭配概念 · AI 示意，非現售款式</figcaption>
      </figure>
      <div className="story-bespoke-bottom" data-story-reveal>
        <div><h3>高級訂製，從您的標準開始。</h3><p>分享腕錶品牌、型號、尺寸與照片，再一起討論寶石、金屬色澤與設計。實際結構、可製作範圍與報價，由專人依錶款確認。</p><p className="story-models">APPLE WATCH <span>／</span> 圓形錶 <span>／</span> 方形錶 <span>／</span> 酒桶形錶</p></div>
        <button type="button" className="gold-button" onClick={onConsult}>討論我的訂製 <ArrowUpRight size={18}/></button>
      </div>
    </section>
  </div>;
}
