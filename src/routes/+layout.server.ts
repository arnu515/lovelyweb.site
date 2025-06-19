import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { auth }, cookies }) => {
  return {
    auth,
    cookies: cookies.getAll()
  };
};
