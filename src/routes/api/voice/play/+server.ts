import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { BlobServiceClient } from '@azure/storage-blob';

const playSchema = z.object({
  messageId: z.string().min(1),
  orgId: z.string().min(1),
  isGroup: z.boolean()
});

export const POST: RequestHandler = async ({ request, locals: { auth } }) => {
  try {
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = playSchema.parse(body);

    // Create Supabase service role client
    const supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Get the message and verify access
    let messageData;
    let blobPath;

    if (validatedData.isGroup) {
      // Check group message access
      const { data: message, error: messageError } = await supabase
        .from('group_messages')
        .select('data, group_id')
        .eq('id', validatedData.messageId)
        .eq('org_id', validatedData.orgId)
        .eq('typ', 'voice')
        .single();

      if (messageError || !message) {
        return json({ error: 'Message not found' }, { status: 404 });
      }

      // Verify user is a member of the group
      const { data: membership, error: membershipError } = await supabase
        .from('chat_group_members')
        .select('user_id')
        .eq('group_id', message.group_id)
        .eq('user_id', auth.user.id)
        .single();

      if (membershipError || !membership) {
        return json({ error: 'Access denied' }, { status: 403 });
      }

      messageData = message.data;
    } else {
      // Check individual message access
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('data, from_id, to_id')
        .eq('id', validatedData.messageId)
        .eq('org_id', validatedData.orgId)
        .eq('typ', 'voice')
        .single();

      if (messageError || !message) {
        return json({ error: 'Message not found' }, { status: 404 });
      }

      // Verify user is either sender or recipient
      if (message.from_id !== auth.user.id && message.to_id !== auth.user.id) {
        return json({ error: 'Access denied' }, { status: 403 });
      }

      messageData = message.data;
    }

    // Extract blob path from message data
    if (typeof messageData === 'object' && messageData !== null && 'url' in messageData) {
      blobPath = messageData.url as string;
    } else {
      return json({ error: 'Invalid message data' }, { status: 400 });
    }

    // Initialize Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('voice-messages');
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Generate signed URL (valid for 1 hour)
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: 'r', // read only
      expiresOn
    });

    return json({ 
      success: true, 
      url: sasUrl,
      duration: messageData.time || 0,
      size: messageData.size || 0
    });

  } catch (error: any) {
    captureException(error, { tags: { action: 'voice_play' } });
    
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};