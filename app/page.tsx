import Atelier from '@/components/atelier';
import {env} from '@/lib/platform';
export const dynamic='force-dynamic';
export default function Home(){return <Atelier inquiriesEnabled={!!env.DB}/>;}
