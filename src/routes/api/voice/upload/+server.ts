import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { captureException } from '@sentry/sveltekit';
import { BlobServiceClient } from '@azure/storage-blob';

const uploadSchema = z.object({
  messageId: z.string().min(1),
  orgId: z.string().min(1),
  senderId: z.string().min(1),
  toId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
  duration: z.number().min(0).max(30),
  size: z.number().min(1),
  contentType: z.string().refine(type => type === 'audio/webm' || type === 'audio/webm;codecs=opus', {
    message: 'Content type must be audio/webm'
  })
});

export const POST: RequestHandler = async ({ request, locals: { auth } }) => {
  try {
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!audioFile) {
      return json({ error: 'No audio file provided' }, { status: 400 });
    }

    const validatedData = uploadSchema.parse(metadata);

    // Validate that user is the sender
    if (validatedData.senderId !== auth.user.id) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate that either toId or groupId is provided, but not both
    if ((!validatedData.toId && !validatedData.groupId) || (validatedData.toId && validatedData.groupId)) {
      return json({ error: 'Either toId or groupId must be provided' }, { status: 400 });
    }

    // Initialize Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('voice-messages');

    // Create blob path: voice/[orgId]/[senderId]/[messageId].webm
    const blobPath = `voice/${validatedData.orgId}/${validatedData.senderId}/${validatedData.messageId}.webm`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Upload to Azure Blob Storage
    const arrayBuffer = await audioFile.arrayBuffer();
    await blockBlobClient.upload(arrayBuffer, arrayBuffer.byteLength, {
      blobHTTPHeaders: {
        blobContentType: validatedData.contentType
      }
    });

    // Create Supabase service role client
    const supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Insert message into Supabase using RPC
    const messageData = {
      time: validatedData.duration,
      size: validatedData.size,
      url: blobPath
    };

    let error;
    if (validatedData.groupId) {
      // Group message
      ({ error } = await supabase.rpc('send_group_voice_message', {
        msg_id: validatedData.messageId,
        group_id: validatedData.groupId,
        org_id: validatedData.orgId,
        by_id: validatedData.senderId,
        time_sec: validatedData.duration,
        size_bytes: validatedData.size,
        blob_path: blobPath
      }));
    } else {
      // Individual message
      ({ error } = await supabase.rpc('send_voice_message', {
        msg_id: validatedData.messageId,
        to_id: validatedData.toId!,
        org_id: validatedData.orgId,
        from_id: validatedData.senderId,
        time_sec: validatedData.duration,
        size_bytes: validatedData.size,
        blob_path: blobPath
      }));
    }

    if (error) {
      // If Supabase insertion fails, try to clean up the blob
      try {
        await blockBlobClient.delete();
      } catch (cleanupError) {
        console.error('Failed to cleanup blob after Supabase error:', cleanupError);
      }
      
      captureException(error, { tags: { supabase: 'voice_message_rpc' } });
      return json({ error: error.message }, { status: 500 });
    }

    return json({ 
      success: true, 
      messageId: validatedData.messageId,
      blobPath 
    });

  } catch (error: any) {
    captureException(error, { tags: { action: 'voice_upload' } });
    
    if (error instanceof z.ZodError) {
      return json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};