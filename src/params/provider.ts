import type { ParamMatcher } from '@sveltejs/kit';
import type { Provider } from '@supabase/supabase-js';

const PROVIDERS: Provider[] = ['github'];

export const match = ((param: string): param is Provider =>
  PROVIDERS.includes(param as Provider)) satisfies ParamMatcher;
