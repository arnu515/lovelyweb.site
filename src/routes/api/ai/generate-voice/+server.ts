import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';
import { BlobServiceClient } from '@azure/storage-blob';
import { AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { nanoid } from 'nanoid';

// In-memory rate limiting
const rateLimits = new Map<string, number>();

// Validate request body
const generateVoiceSchema = z.object({
  message: z.string().min(1).max(500),
  voice: z.enum(['male', 'female', 'robot']),
  toId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
  orgId: z.string().min(1)
});

export const POST: RequestHandler = async ({ request, locals: { auth } }) => {
  try {
    // Check authentication
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    
    // Check rate limit (1 per 5 minutes)
    const now = Date.now();
    const lastUsed = rateLimits.get(userId) || 0;
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    if (now - lastUsed < fiveMinutesInMs) {
      const remainingSeconds = Math.ceil((fiveMinutesInMs - (now - lastUsed)) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return json({ 
        error: `Rate limited. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.` 
      }, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateVoiceSchema.parse(body);

    // Validate that either toId or groupId is provided, but not both
    if ((!validatedData.toId && !validatedData.groupId) || (validatedData.toId && validatedData.groupId)) {
      return json({ error: 'Either toId or groupId must be provided' }, { status: 400 });
    }

    // Set rate limit
    rateLimits.set(userId, now);

    // Generate a unique message ID
    const messageId = nanoid();

    // For now, we'll simulate generating a voice message
    // In a real implementation, you would call ElevenLabs API here
    
    // Simulate generating audio data (this would be the response from ElevenLabs)
    const audioData = await simulateVoiceGeneration(validatedData.message, validatedData.voice);
    
    // Create a blob from the audio data
    const audioBlob = new Blob([audioData], { type: 'audio/webm' });
    
    // Upload to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('voice-messages');
    
    // Create blob path: [orgId]/[senderId]/[messageId].webm
    const blobPath = `${validatedData.orgId}/${userId}/${messageId}.webm`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Upload the blob
    await blockBlobClient.upload(audioData, audioData.byteLength, {
      blobHTTPHeaders: {
        blobContentType: 'audio/webm'
      }
    });

    // Create Supabase service role client
    const supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Calculate duration (simulated)
    const durationInSeconds = Math.min(30, validatedData.message.length / 20);
    const sizeInBytes = audioData.byteLength;

    // Insert into database using RPC function
    let error;
    if (validatedData.groupId) {
      // Group message
      ({ error } = await supabase.rpc('send_group_voice_message', {
        msg_id: messageId,
        group_id: validatedData.groupId,
        org_id: validatedData.orgId,
        by_id: userId,
        time_sec: durationInSeconds,
        size_bytes: sizeInBytes,
        blob_path: blobPath
      }));
    } else {
      // Individual message
      ({ error } = await supabase.rpc('send_voice_message', {
        msg_id: messageId,
        to_id: validatedData.toId!,
        org_id: validatedData.orgId,
        from_id: userId,
        time_sec: durationInSeconds,
        size_bytes: sizeInBytes,
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
      
      throw new Error(error.message);
    }

    return json({ 
      success: true, 
      messageId,
      duration: durationInSeconds,
      size: sizeInBytes
    });

  } catch (error: any) {
    captureException(error, { tags: { action: 'generate_voice' } });
    
    if (error instanceof z.ZodError) {
      return json({ 
        error: 'Invalid request data', 
        details: error.issues.map(i => i.message).join('\n') 
      }, { status: 400 });
    }
    
    return json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
};

// Simulate voice generation (to be replaced with actual ElevenLabs API call)
async function simulateVoiceGeneration(text: string, voice: string): Promise<ArrayBuffer> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create a simple audio buffer (this is just a placeholder)
  const sampleRate = 44100;
  const duration = Math.min(30, text.length / 20); // Roughly 20 chars per second, max 30 seconds
  const frameCount = sampleRate * duration;
  
  const audioBuffer = new ArrayBuffer(frameCount * 2); // 16-bit audio = 2 bytes per sample
  const view = new DataView(audioBuffer);
  
  // Generate a simple sine wave based on the voice type
  const frequency = voice === 'male' ? 150 : voice === 'female' ? 250 : 200;
  
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate;
    const amplitude = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    const sample = Math.floor(amplitude * 32767);
    view.setInt16(i * 2, sample, true);
  }
  
  return audioBuffer;
}