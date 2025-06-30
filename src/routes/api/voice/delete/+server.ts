import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { BlobServiceClient } from '@azure/storage-blob';

const deleteSchema = z.object({
  messageId: z.string().min(1),
  orgId: z.string().min(1),
  isGroup: z.boolean()
});

export const POST: RequestHandler = async ({ request, locals: { supabase, auth } }) => {
  try {
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = deleteSchema.parse(body);

    // Get the message and verify ownership
    let messageData;
    let blobPath;

    if (validatedData.isGroup) {
      // Check group message access
      const { data: message, error: messageError } = await supabase
        .from('group_messages')
        .select('data, by_id')
        .eq('id', validatedData.messageId)
        .eq('org_id', validatedData.orgId)
        .eq('typ', 'voice')
        .single();

      if (messageError || !message) {
        return json({ error: 'Message not found' }, { status: 404 });
      }

      // Verify user is the sender
      if (message.by_id !== auth.user.id) {
        return json({ error: 'You can only delete your own messages' }, { status: 403 });
      }

      messageData = message.data;
    } else {
      // Check individual message access
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('data, from_id')
        .eq('id', validatedData.messageId)
        .eq('org_id', validatedData.orgId)
        .eq('typ', 'voice')
        .single();

      if (messageError || !message) {
        return json({ error: 'Message not found' }, { status: 404 });
      }

      // Verify user is the sender
      if (message.from_id !== auth.user.id) {
        return json({ error: 'You can only delete your own messages' }, { status: 403 });
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

    // Delete the blob
    try {
      await blockBlobClient.delete();
    } catch (error: any) {
      // If the blob doesn't exist, we can still proceed with deleting the message
      if (error.statusCode !== 404) {
        captureException(error, { tags: { action: 'delete_voice_blob' } });
        console.error('Failed to delete blob:', error);
        // We'll continue with deleting the message even if blob deletion fails
      }
    }

    // Delete the message from the database
    if (validatedData.isGroup) {
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', validatedData.messageId);

      if (error) {
        captureException(error, { tags: { supabase: 'group_messages_delete' } });
        return json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', validatedData.messageId);

      if (error) {
        captureException(error, { tags: { supabase: 'messages_delete' } });
        return json({ error: error.message }, { status: 500 });
      }
    }

    return json({ 
      success: true,
      message: 'Voice message deleted successfully'
    });

  } catch (error: any) {
    captureException(error, { tags: { action: 'voice_delete' } });
    
    if (error instanceof z.ZodError) {
      return json({ error: error.issues.map(i => i.message).join('\n') }, { status: 400 });
    }
    
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};