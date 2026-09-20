import {env} from '@/lib/platform';
export function database(){if(!env.DB)throw new Error('Inquiry database unavailable');return env.DB;}
