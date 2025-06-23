import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
  const data = await parent();

  // Here you would fetch the specific chat data
  // For now, we'll just pass through the parent data
  return {
    ...data,
    chatId: params.chatId
  };
};
