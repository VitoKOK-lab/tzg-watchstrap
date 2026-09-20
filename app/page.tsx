import Atelier from '@/components/atelier';
import {inquiryEmailConfig} from '@/lib/inquiry-email';
export const dynamic='force-dynamic';
export default function Home(){return <Atelier inquiriesEnabled={!!inquiryEmailConfig()}/>;}
