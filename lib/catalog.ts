export const LINE_URL = 'https://lin.ee/OHHy0Lj';
export const LINE_ID = '@vmo7014k';
export const services = [
  { id: 'collection', title: '現有設計錶帶', full: '泰熙爾札娜現有 Apple Watch 錶帶', subtitle: '從五款設計中，找到心動的那一款。' },
  { id: 'custom-band', title: '客製 Apple Watch 錶帶', full: '客製其他 Apple Watch 錶帶', subtitle: '把您的想法，化為腕間的風格。' },
  { id: 'jewellery-watch', title: '訂製珠寶錶', full: '訂製珠寶錶（整支，包含錶面）', subtitle: '從錶面到錶帶，完整表達您的品味。' },
] as const;
export type PriceOption = { id: string; label: string; shell: number; band: number | null; total: number | null };
export type ProductVideo = {src:string;poster:string;label:string};
export type Design = { id: string; number: string; model: string; name: string; image: string; lifestyleImage?: string; colorImages?: Record<string,string>; colorVideos?: Record<string,ProductVideo>; sampleVideo?: ProductVideo; description: string; options: PriceOption[] };
export const designs: Design[] = [
  { id: 'circle', number:'01',model:'G852', name:'圓環鏈節', image:'/images/circle-retouched.webp',sampleVideo:{src:'/videos/circle-sample.mp4',poster:'/images/circle-sample-poster.jpg',label:'圓環鏈節 · 樣品實拍'}, description:'圓環彼此相扣，讓俐落線條隨手腕自然延伸。', options:[{id:'18k',label:'18K 材質',shell:660000,band:890000,total:1550000},{id:'925',label:'925 無鑽',shell:28000,band:55000,total:83000},{id:'925-case',label:'925 滿鑽錶殼（單品）',shell:89000,band:null,total:null}] },
  { id:'geometric',number:'02',model:'G852-5',name:'幾何輪廓',image:'/images/geometric-retouched.webp',sampleVideo:{src:'/videos/geometric-sample.mp4',poster:'/images/geometric-sample-poster.jpg',label:'幾何輪廓 · 樣品實拍'},description:'以幾何造型與鏈節，勾勒富有層次的腕間輪廓。',options:[{id:'18k',label:'18K 材質',shell:660000,band:1330000,total:1990000},{id:'925',label:'925 無鑽',shell:28000,band:88000,total:116000}] },
  { id:'pave',number:'03',model:'G852-5',name:'幾何光影',image:'/images/pave-retouched.webp',colorVideos:{white:{src:'/videos/pave-white.mp4',poster:'/images/pave-white-poster.jpg',label:'白K · 實物影片'},yellow:{src:'/videos/pave-yellow.mp4',poster:'/images/pave-yellow-poster.jpg',label:'黃K · 實物影片'}},description:'在幾何線條之間融入鑲嵌細節，呈現細膩光影。',options:[{id:'18k-diamond',label:'18K 真鑽',shell:1300000,band:2300000,total:3600000},{id:'18k-lab',label:'18K 培育',shell:1100000,band:2000000,total:3100000},{id:'18k-moissanite',label:'18K 莫桑',shell:900000,band:1800000,total:2700000},{id:'925',label:'925 滿鑽',shell:150000,band:200000,total:350000}] },
  { id:'green',number:'04',model:'G852-7',name:'綠境星河',image:'/images/green-retouched.webp',colorVideos:{white:{src:'/videos/green-white.mp4',poster:'/images/green-white-video-poster.jpg',label:'白K · 實物影片'}},description:'深綠長方石與細緻光芒並列，像一段落在腕間的星河。',options:[{id:'18k-diamond',label:'18K 真鑽',shell:1300000,band:3200000,total:4500000},{id:'18k-lab',label:'18K 培育',shell:1100000,band:2700000,total:3800000},{id:'18k-moissanite',label:'18K 莫桑',shell:900000,band:2300000,total:3200000},{id:'925',label:'925 滿鑽',shell:150000,band:300000,total:450000}] },
  { id:'coloured',number:'05',model:'G852-6',name:'多彩序曲',image:'/images/coloured-retouched.webp',colorVideos:{white:{src:'/videos/coloured-white.mp4',poster:'/images/coloured-white-poster.jpg',label:'白K · 實物影片'}},description:'不同色彩與造型相互交織，展現豐富的視覺層次。',options:[{id:'18k-diamond',label:'18K 真鑽',shell:1300000,band:5200000,total:6500000},{id:'18k-lab',label:'18K 培育',shell:1100000,band:3100000,total:4200000},{id:'18k-moissanite',label:'18K 莫桑',shell:900000,band:2900000,total:3800000},{id:'925',label:'925 滿鑽',shell:150000,band:300000,total:450000}] },
];
export const colors = [
  {id:'white',label:'白K',hex:'#d2d2cc'},
  {id:'yellow',label:'黃K',hex:'#d1b76c'},
  {id:'rose',label:'玫瑰金',hex:'#b9846b'},
  {id:'black',label:'黑金',hex:'#4a4b4b'},
] as const;
export const budgets = [
  {id:'under-100k',label:'未滿 10 萬'}, {id:'100k-300k',label:'10 萬至未滿 30 萬'},
  {id:'300k-500k',label:'30 萬至未滿 50 萬'}, {id:'500k-1m',label:'50 萬至未滿 100 萬'},
  {id:'1m-3m',label:'100 萬至未滿 300 萬'}, {id:'over-3m',label:'300 萬以上'},
] as const;
export function money(amount:number|null){return amount===null?'—':`NT$ ${amount.toLocaleString('en-US')}`;}
export function lineMessageUrl(reference:string){return `https://line.me/R/oaMessage/${encodeURIComponent(LINE_ID)}/?${encodeURIComponent(`您好，我已在網站填寫諮詢，編號：${reference}，想請專人協助確認，謝謝。`)}`;}
