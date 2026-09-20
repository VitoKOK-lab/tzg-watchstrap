import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'泰熙爾札娜｜G852 系列 Apple Watch 珠寶錶帶',description:'探索 G852 系列五款 Apple Watch 珠寶錶帶、四種顏色及各材質定價。留下需求與預算，由專人與您討論現有款式、客製錶帶或整支珠寶錶訂製。',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;}
