'use client';
import {useRef,useState,type FormEvent} from 'react';
import {ArrowRight,ArrowUpRight,Check,Copy,LoaderCircle,MessageCircle,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {Checkbox} from '@/components/ui/checkbox';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {budgets,colors,designs,services,LINE_URL,lineMessageUrl,money} from '@/lib/catalog';
import {inquiryLineSummary} from '@/lib/inquiry-line';
import {HeroIntro} from '@/components/hero-intro';
import {BrandStory,BespokeStory} from '@/components/brand-story';

export default function Atelier({inquiriesEnabled=true}:{inquiriesEnabled?:boolean}){
  const [selected,setSelected]=useState('circle');
  const [option,setOption]=useState('925');
  const [color,setColor]=useState('');
  const [detailView,setDetailView]=useState<'product'|'video'|'lifestyle'>('product');
  const [lifestyleIndex,setLifestyleIndex]=useState(0);
  const [service,setService]=useState('');
  const [formDesign,setFormDesign]=useState('');
  const [formOption,setFormOption]=useState('');
  const [formColor,setFormColor]=useState('');
  const [contactType,setContactType]=useState('phone');
  const [consent,setConsent]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const [deliveryFailed,setDeliveryFailed]=useState(false);
  const [lineDraft,setLineDraft]=useState('');
  const [lineCopied,setLineCopied]=useState(false);
  const [manualCopy,setManualCopy]=useState(false);
  const [reference,setReference]=useState('');
  const [copied,setCopied]=useState(false);
  const requestId=useRef('');
  const lastSubmission=useRef('');
  const successRef=useRef<HTMLDivElement>(null);
  const failureRef=useRef<HTMLDivElement>(null);
  const active=designs.find(d=>d.id===selected)!;
  const price=active.options.find(p=>p.id===option)||active.options[0];
  const matchedVideo=color?active.colorVideos?.[color]:undefined;
  const availableVideo=matchedVideo||active.sampleVideo||active.colorVideos?.white||Object.values(active.colorVideos||{})[0];
  const selectedColorLabel=colors.find(c=>c.id===color)?.label;
  const colorImage=color?active.colorImages?.[color]:undefined;
  const selectedLifestyle=active.lifestyleImages?.[lifestyleIndex];
  const detailImage=detailView==='lifestyle'&&selectedLifestyle?selectedLifestyle.src:colorImage||active.image;
  const detailImageLabel=detailView==='lifestyle'&&selectedLifestyle?selectedLifestyle.label:colorImage?`${selectedColorLabel}商品照`:'白K商品照';
  const detailImageAlt=detailView==='lifestyle'&&selectedLifestyle?`${active.model} ${active.name} ${selectedLifestyle.label}`:`${active.model} ${active.name} ${detailImageLabel}`;
  const detailVideo=detailView==='video'?availableVideo:undefined;
  const requestedDesign=designs.find(d=>d.id===formDesign);
  const requestedPrice=requestedDesign?.options.find(p=>p.id===formOption);
  function chooseDesign(id:string){setSelected(id);setOption('925');setColor('');setLifestyleIndex(0);setDetailView('product');document.getElementById('design-detail')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function inquire(nextService?:string,includeDesign=false){if(nextService)setService(nextService);if(includeDesign){setFormDesign(selected);setFormOption(price.id);setFormColor(color);}document.getElementById('inquiry-form')?.scrollIntoView({behavior:'smooth',block:'start'});}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending)return;
    if(!service){setError('請先選擇您想諮詢的服務。');document.getElementById('service-collection')?.focus();return;}
    if(!consent){setError('請閱讀並勾選諮詢資料使用說明。');return;}
    const data=new FormData(event.currentTarget);
    const payload={...Object.fromEntries(data),service,design:service==='collection'?formDesign:'',material:service==='collection'?formOption:'',color:service==='collection'?formColor:'',consent};
    const signature=JSON.stringify(payload);
    if(signature!==lastSubmission.current){requestId.current=crypto.randomUUID();lastSubmission.current=signature;}
    setPending(true);setError('');setDeliveryFailed(false);setLineCopied(false);setManualCopy(false);
    setLineDraft(inquiryLineSummary(payload,requestId.current));
    try{
      const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId:requestId.current}),signal:AbortSignal.timeout(20000)});
      const result=await response.json() as {error?:unknown;reference?:unknown};
      if(!response.ok)throw new Error(typeof result.error==='string'?result.error:'目前無法確認送出結果，請透過官方 LINE 聯繫我們。');
      if(typeof result.reference!=='string'||!/^TZ-[A-F0-9]{16}$/.test(result.reference))throw new Error('目前無法確認送出結果，請透過官方 LINE 聯繫我們。');
      setReference(result.reference);requestAnimationFrame(()=>{successRef.current?.focus();successRef.current?.scrollIntoView({behavior:'smooth',block:'center'});});
    }catch(err){
      setError(err instanceof Error && !['TimeoutError','TypeError','SyntaxError','AbortError'].includes(err.name)?err.message:'連線未完成，尚未確認送出結果。請確認網路，或改用官方 LINE 聯繫我們。');
      setDeliveryFailed(true);
      requestAnimationFrame(()=>{failureRef.current?.focus();failureRef.current?.scrollIntoView({behavior:'smooth',block:'center'});});
    }finally{setPending(false);}
  }
  async function copyLineDraft(){try{await navigator.clipboard.writeText(lineDraft);setLineCopied(true);setManualCopy(false);}catch{setLineCopied(false);setManualCopy(true);}}
  async function copyReference(){try{await navigator.clipboard.writeText(reference);setCopied(true);}catch{setCopied(false);}}
  return <div className="atelier-edition">
    <a href="#main" className="skip-link">跳至主要內容</a>
    <header className="site-header"><a href="#craftsmanship" className="header-editorial-link">工藝與訂製</a><a href="#" className="wordmark" aria-label="泰熙爾札娜 首頁">泰熙爾札娜<span>JEWELLERY & TIME</span></a><nav aria-label="主要導覽"><a href="#collection">款式與價格</a><a href="#inquiry-form" className="nav-cta">預約諮詢 <ArrowUpRight size={16}/></a></nav></header>
    <main id="main">
      <section className="hero hero-product" aria-labelledby="hero-title">
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="eyebrow">G852 系列 · 適用 APPLE WATCH 的珠寶錶帶</p>
            <h1 id="hero-title">讓時間，<br/><span>戴上珠寶。</span></h1>
            <p>五款設計，四種金屬色。<br/>讓每一次抬腕，都更像自己。</p>
            <div className="hero-actions">
              <a href="#collection" className="gold-button inline-flex">探索 G852 系列 <ArrowRight size={18}/></a>
              <a href="#inquiry-form" className="text-link">預約專屬諮詢 <ArrowUpRight size={17}/></a>
            </div>
          </div>
          <figure className="hero-visual">
            <picture>
              <source media="(max-width: 760px)" srcSet="/images/hero-g852-7-watch-v7-mobile-640.webp 640w, /images/hero-g852-7-watch-v7-mobile-960.webp 960w" sizes="100vw"/>
              <img src="/images/hero-g852-7-watch-v7-1536.webp" srcSet="/images/hero-g852-7-watch-v7-960.webp 960w, /images/hero-g852-7-watch-v7-1536.webp 1536w" sizes="1320px" width="1672" height="941" alt="女性與朋友聊天時佩戴 G852-7 綠境星河珠寶錶帶的情境示意，側面可見 Apple Watch 錶面" fetchPriority="high"/>
            </picture>
            <HeroIntro/>
            <figcaption><strong>G852-7</strong><span>綠境星河</span><span className="hero-image-note">· 佩戴情境示意</span></figcaption>
          </figure>
        </div>
        <div className="hero-footnote"><span>五款現有設計</span><i/><span>每款四種金屬色</span><i/><span>選配後預約諮詢</span></div>
      </section>
      <BrandStory/>
      <section className="collection-section section-shell" id="collection" aria-labelledby="collection-title"><div className="section-heading"><div><p className="eyebrow">G852 COLLECTION / FIVE DESIGNS</p><h2 id="collection-title">腕間的五種表情。</h2></div><p>從細緻鏈節，到鮮明的色彩排列。<br/>選擇作品，探索材質與定價。</p></div><div className="collection-grid">{designs.map(item=><button key={item.id} className={`design-card ${selected===item.id?'active':''}`} onClick={()=>chooseDesign(item.id)} aria-pressed={selected===item.id}><div className="design-image"><img src={item.image} width="1254" height="1254" loading="lazy" alt={`${item.model} ${item.name}白K SHOPLINE商品實拍`}/></div><div className="design-caption"><div><p>{item.model}</p><h3>{item.name}</h3></div><ArrowUpRight size={19}/></div></button>)}</div>
      <div className="design-detail" id="design-detail"><div className="detail-gallery"><div className="detail-image">{detailVideo?<video key={detailVideo.src} src={detailVideo.src} poster={detailVideo.poster} autoPlay muted loop playsInline controls preload="metadata" aria-label={`${active.model} ${active.name} ${detailVideo.label}`}/>:<img src={detailImage} width="1254" height="1254" loading="lazy" alt={detailImageAlt}/>}<span>{active.model} · {detailVideo?`${detailVideo.label}${color&&!matchedVideo?'（非目前選色）':''}`:detailImageLabel}</span></div>{availableVideo&&<div className="product-media-tabs" aria-label={`${active.name}照片與影片`}><button type="button" className={detailView==='product'?'active':''} onClick={()=>setDetailView('product')} aria-pressed={detailView==='product'}><span className="media-thumb"><img src={colorImage||active.image} alt="" width="64" height="64"/></span><span className="media-label"><strong>{colorImage?`${selectedColorLabel}商品照`:'白K商品照'}</strong><small>SHOPLINE 商品實拍</small></span></button><button type="button" className={detailVideo?'active':''} onClick={()=>setDetailView('video')} aria-pressed={!!detailVideo} aria-label="播放實物影片"><span className="media-thumb video-thumb"><img src={availableVideo.poster} alt="" width="64" height="64"/><Play size={20} fill="currentColor"/></span><span className="media-label"><strong>實物影片</strong><small>{availableVideo.label.replace(`${active.name} · `,'')}</small></span></button></div>}{active.lifestyleImages?.length ? <div className="lifestyle-thumbnails" aria-label={`${active.name}情境照片`}>{active.lifestyleImages.map((photo,index)=><button key={photo.src} type="button" className={detailView==='lifestyle'&&lifestyleIndex===index?'active':''} onClick={()=>{setLifestyleIndex(index);setDetailView('lifestyle');}} aria-pressed={detailView==='lifestyle'&&lifestyleIndex===index}><img src={photo.src} alt="" width="120" height="96" loading="lazy"/><span>{photo.label}</span></button>)}</div>:null}{color&&!matchedVideo&&<p className="media-availability" role="status">此色暫無對應實拍影片。影片入口可查看本款樣品，並非目前選色。</p>}</div><div className="detail-copy"><p className="eyebrow">{active.model} / PERSONALISE YOUR TIME</p><h3>{active.name}</h3><p>{active.description}</p><div className="field"><label htmlFor="material">材質與鑲嵌</label><NativeSelect id="material" value={price.id} onChange={e=>setOption(e.target.value)}>{active.options.map(p=><NativeSelectOption key={p.id} value={p.id}>{p.label}</NativeSelectOption>)}</NativeSelect></div><fieldset className="color-field"><legend>色彩選擇 <span>{colors.find(c=>c.id===color)?.label || '可於諮詢時確認'}</span></legend><RadioGroup className="color-options" value={color} onValueChange={value=>{setColor(value);setDetailView('product');}} aria-label="色彩選擇">{colors.map(c=><label key={c.id} className={color===c.id?'selected':''}><RadioGroupItem value={c.id} className="color-swatch" style={{background:c.hex}} aria-label={c.label}/><span>{c.label}</span></label>)}</RadioGroup></fieldset><dl className="exact-prices"><div><dt>錶殼</dt><dd>{money(price.shell)}</dd></div><div><dt>錶帶</dt><dd>{money(price.band)}</dd></div><div className="total-price"><dt>{price.total===null?'單品錶殼':'錶殼＋錶帶整套'}</dt><dd>{money(price.total??price.shell)}</dd></div></dl><p className="price-inclusions"><strong>四色同價</strong><span>{price.total===null?'此選配為單品錶殼，不含錶帶及 Apple Watch 主機。':'售價為錶殼＋錶帶配件，不含 Apple Watch 主機。'}</span></p><div className="purchase-actions"><a className="gold-button" href={active.purchaseUrl} target="_blank" rel="noopener noreferrer">前進購買 <ArrowUpRight size={18}/></a><button type="button" className="text-link" onClick={()=>inquire('collection',true)}>訂製諮詢 <ArrowRight size={16}/></button></div><p className="purchase-hint">前往官網商品頁選擇規格與顏色後下單。</p><small className="sample-note">商品與選色照片取自 SHOPLINE 商品頁，並以相同方形比例置中呈現；實際色澤與細節請參考實物影片並由專人確認。</small></div></div></section>
      <BespokeStory onConsult={()=>inquire('custom-band')}/>
      <section className="consult-section section-shell" id="consultation" aria-labelledby="consult-title"><div className="consult-intro"><p className="eyebrow">PERSONAL SERVICE</p><h2 id="consult-title">從您的想法開始。</h2><p>{inquiriesEnabled?<>選擇服務與預算，留下聯絡方式；<br className="desktop-break"/>我們會主動與您聯繫。</>:<>透過官方 LINE 告訴我們您的需求，<br className="desktop-break"/>由專人與您討論。</>}</p></div>
      <div className="form-panel" id="inquiry-form">{!inquiriesEnabled?<div className="success-panel"><p className="eyebrow">CONTACT US</p><h3>預約專屬諮詢</h3><p>線上表單尚未開放，歡迎先加入官方 LINE，告訴我們您喜歡的款式與預算。</p><a className="gold-button inline-flex" href={LINE_URL} target="_blank" rel="noopener noreferrer">加入官方 LINE <ArrowUpRight size={18}/></a></div>:reference?<div className="success-panel" ref={successRef} tabIndex={-1} role="status"><span className="success-icon"><Check size={30}/></span><p className="eyebrow">THANK YOU</p><h3>您的諮詢已送出。</h3><p>我們將依您留下的聯絡方式與您聯繫。<br/>您也可以加入 LINE，傳送編號接續討論。</p><div className="reference-box"><span>您的諮詢編號</span><strong>{reference}</strong><Button variant="ghost" onClick={copyReference}><Copy size={16}/>{copied?'已複製':'複製編號'}</Button></div><a className="gold-button inline-flex" href={lineMessageUrl(reference)} target="_blank" rel="noopener noreferrer">在 LINE 接續諮詢 <ArrowUpRight size={18}/></a><small>開啟 LINE 後，請按「送出」傳送已帶入的諮詢編號。</small><a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="text-link">加入官方 LINE <ArrowUpRight size={15}/></a></div>:<form onSubmit={submit} onChange={()=>{if(!pending){setError('');setDeliveryFailed(false);setLineCopied(false);setManualCopy(false);}}}><div className="form-title"><h3>預約諮詢</h3><span>＊為必填欄位</span></div><fieldset className="service-field"><legend>您想諮詢的服務 <span>＊</span></legend><RadioGroup value={service} onValueChange={setService} aria-label="您想諮詢的服務" required>{services.map(item=><label className={`service-option ${service===item.id?'is-selected':''}`} key={item.id} htmlFor={`service-${item.id}`}><RadioGroupItem id={`service-${item.id}`} value={item.id}/><span>{item.full}</span></label>)}</RadioGroup></fieldset>
      {service==='collection'&&<><div className="field"><label htmlFor="formDesign">感興趣的款式 <small>選填</small></label><NativeSelect id="formDesign" value={formDesign} onChange={e=>{setFormDesign(e.target.value);setFormOption('');setFormColor('');}}><NativeSelectOption value="">尚未決定，請協助推薦</NativeSelectOption>{designs.map(item=><NativeSelectOption key={item.id} value={item.id}>{item.model} · {item.name}</NativeSelectOption>)}</NativeSelect></div>{requestedDesign&&<div className="form-columns"><div className="field"><label htmlFor="formOption">材質與鑲嵌 <small>選填</small></label><NativeSelect id="formOption" value={formOption} onChange={e=>setFormOption(e.target.value)}><NativeSelectOption value="">請協助建議</NativeSelectOption>{requestedDesign.options.map(p=><NativeSelectOption key={p.id} value={p.id}>{p.label}</NativeSelectOption>)}</NativeSelect></div><div className="field"><label htmlFor="formColor">色彩 <small>選填</small></label><NativeSelect id="formColor" value={formColor} onChange={e=>setFormColor(e.target.value)}><NativeSelectOption value="">尚未決定</NativeSelectOption>{colors.map(c=><NativeSelectOption key={c.id} value={c.id}>{c.label}</NativeSelectOption>)}</NativeSelect></div></div>}{requestedPrice&&<p className="selected-price">{requestedDesign?.model} · {requestedDesign?.name} · {requestedPrice.total===null?'單品錶殼':'錶殼＋錶帶整套'} <strong>{money(requestedPrice.total??requestedPrice.shell)}</strong></p>}</>}
      <div className="field"><label htmlFor="budget">預算區間 <span>＊</span></label><NativeSelect id="budget" name="budget" defaultValue="" required><NativeSelectOption value="" disabled>請選擇預算（新臺幣）</NativeSelectOption>{budgets.map(item=><NativeSelectOption key={item.id} value={item.id}>{item.label}</NativeSelectOption>)}</NativeSelect></div><div className="form-columns"><div className="field"><label htmlFor="name">您的稱呼 <span>＊</span></label><Input id="name" name="name" autoComplete="name" placeholder="姓名或稱呼" maxLength={60} required/></div><div className="field"><label htmlFor="contactType">聯絡方式 <span>＊</span></label><NativeSelect id="contactType" name="contactType" value={contactType} onChange={e=>setContactType(e.target.value)}><NativeSelectOption value="phone">手機／電話</NativeSelectOption><NativeSelectOption value="email">Email</NativeSelectOption></NativeSelect></div></div><div className="field"><label htmlFor="contact">{contactType==='phone'?'電話號碼':'Email'} <span>＊</span></label><Input id="contact" name="contact" type={contactType==='phone'?'tel':'email'} autoComplete={contactType==='phone'?'tel':'email'} placeholder={contactType==='phone'?'請填寫可聯繫的電話':'請填寫可聯繫的 Email'} maxLength={160} required/><small>方便我們在收到表單後主動聯繫您。</small></div>{service&&service!=='jewellery-watch'&&<div className="field"><label htmlFor="watchModel">{service==='collection'?'Apple Watch 型號／尺寸':'腕錶品牌／型號／尺寸'} <small>選填</small></label><Input id="watchModel" name="watchModel" placeholder="若不確定，可留白由專人協助" maxLength={100}/></div>}<div className="field"><label htmlFor="notes">想告訴我們的事 <small>選填</small></label><Textarea id="notes" name="notes" rows={3} placeholder="喜歡的材質、顏色、設計想法，或希望聯絡的時間…" maxLength={1500}/></div><div className="honeypot" aria-hidden="true"><label htmlFor="website">網站</label><input id="website" name="website" autoComplete="off" tabIndex={-1}/></div><label htmlFor="consent" className="consent"><Checkbox id="consent" checked={consent} onCheckedChange={v=>setConsent(v===true)} required/><span>我同意泰熙爾札娜使用以上資料，與我聯繫並提供本次諮詢服務。資料將以 Email 傳送給授權服務人員，僅供本次諮詢使用。</span></label>{error&&(deliveryFailed?<div className="form-recovery" ref={failureRef} tabIndex={-1} role="alert"><h4>尚未確認送出，請改用官方 LINE</h4><p>{error}</p><p>已填內容仍保留。建議複製需求，再開啟 LINE 貼上，讓專人接續協助您。</p><div className="recovery-actions"><Button type="button" variant="outline" onClick={copyLineDraft}><Copy size={16}/>{lineCopied?'需求已複製':'複製已填需求'}</Button><a className="recovery-line" href={LINE_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>開啟官方 LINE <ArrowUpRight size={16}/></a></div><p className="recovery-hint" role="status">{lineCopied?'已複製。開啟 LINE 後請貼上內容，再按送出。':'官方 LINE：@vmo7014k。開啟後請貼上需求並按送出。'}</p><details className="manual-copy" open={manualCopy} onToggle={event=>setManualCopy(event.currentTarget.open)}><summary>查看或手動複製需求</summary><label htmlFor="line-draft">請選取下方內容，複製後貼到官方 LINE</label><Textarea id="line-draft" value={lineDraft} readOnly rows={7} onFocus={event=>event.currentTarget.select()}/></details><small>若暫時無法使用 LINE，也可致電 <a href="tel:047512210">04-7512210</a>。連線中斷時，通知仍可能已寄出；我們會依辨識碼核對需求。</small></div>:<p className="form-error" role="alert">{error}</p>)}<Button className="gold-button submit-button" type="submit" disabled={pending}>{pending?<><LoaderCircle className="animate-spin"/> 正在送出，請稍候</>:<>{deliveryFailed?'再試一次送出':'送出諮詢'} <ArrowUpRight/></>}</Button><p className="form-footnote">送出為諮詢申請，實際搭配與客製報價由專人與您確認。<br/>如果無法送出，請改用 <a href={LINE_URL} target="_blank" rel="noopener noreferrer">官方 LINE @vmo7014k</a> 聯繫我們。</p></form>}</div><div className="contact-details"><h3>聯絡我們</h3><dl><div><dt>聯絡電話</dt><dd><a href="tel:047512210">04-7512210</a></dd></div><div><dt>客服信箱</dt><dd><a href="mailto:tzgrotw@gmail.com">tzgrotw@gmail.com</a></dd></div><div><dt>官方 LINE</dt><dd><a href={LINE_URL} target="_blank" rel="noopener noreferrer">@vmo7014k <ArrowUpRight size={13}/></a></dd></div><div><dt>實體總部</dt><dd><address>彰化市中山路二段2號12樓</address></dd></div><div><dt>台北信義店</dt><dd><address>台北市信義區信義路五段101號1樓</address><span className="appointment-note">門市全面採預約制</span></dd></div></dl></div></section>
    </main><footer className="site-footer"><a href="#" className="wordmark">泰熙爾札娜<span>JEWELLERY & TIME</span></a><p>把喜歡的樣子，留在每一刻。<small>Apple Watch 是 Apple Inc. 的商標；本網站產品為適用配件，與 Apple Inc. 無隸屬或贊助關係。</small></p><div><a href={LINE_URL} target="_blank" rel="noopener noreferrer">官方 LINE <ArrowUpRight size={14}/></a><span>© {new Date().getFullYear()} 泰熙爾札娜</span></div></footer><div className="mobile-consult"><span>您的腕間，您的風格。</span><Button className="gold-button" onClick={()=>inquire()}>預約諮詢 <ArrowUpRight size={16}/></Button></div>
  </div>;
}
