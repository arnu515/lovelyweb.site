import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';
import { BlobServiceClient } from '@azure/storage-blob';
import { AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, ELEVEN_LABS_KEY } from '$env/static/private';
import type { Database } from '$lib/database.types';
import { nanoid } from 'nanoid';

// In-memory rate limiting
const rateLimits = new Map<string, number>();

const VOICES = {
  'male': 'JBFqnCBsd6RMkjVDRZzb',
  'female': 'XrExE9yKIg1WjnnlVkGX',
}
const VOICE_KEYS = Object.keys(VOICES)

// Validate request body
const generateVoiceSchema = z.object({
  message: z.string().min(12).max(500),
  voice: z.enum(VOICE_KEYS),
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
    const audioData = await genVoice(validatedData.message, validatedData.voice as any);
    
    // Upload to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('voice-messages');
    
    // Create blob path: [orgId]/[senderId]/[messageId].webm
    const blobPath = `${validatedData.orgId}/${userId}/${messageId}.ogx`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Upload the blob
    await blockBlobClient.upload(audioData, audioData.byteLength, {
      blobHTTPHeaders: {
        blobContentType: 'audio/ogg'
      }
    });

    // Create Supabase service role client
    const supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const durationInSeconds = getDuration(audioData, 48000)+1;
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
        error: error.issues.map(i => i.message).join('\n') 
      }, { status: 400 });
    }
    
    return json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
};

async function genVoice(message: string, voice: keyof typeof VOICES) {
  /* curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128" \
     -H "xi-api-key: xi-api-key" \
     -H "Content-Type: application/json" \
     -d '{
  "text": "The first move is what sets everything in motion.",
  "model_id": "eleven_multilingual_v2"
}'*/
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICES[voice]}?output_format=opus_48000_64`, {
    headers: {
      'xi-api-key': ELEVEN_LABS_KEY,
      'Content-Type': "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      text: message,
      model_id: "eleven_multilingual_v2"
    })
  })
  if (!res.ok) {
    const data = await res.json();
    throw new Error(Array.isArray(data.detail) ? data.detail.map((i: any) => i.msg).join("\n") : data.detail?.message || 'Unknown error')
  }
  const data = await res.arrayBuffer();
  return data
}

const OGG_HEADER_SIZE = 27;
const OPUS_HEADER_ID = 0x4F707573; // 'Opus' in hex
function getDuration(buf: ArrayBuffer, sampleRate: number) {
  let totalSamples = 0, offset = 0;
  const bytes = new Uint8Array(buf)
  while (offset < bytes.length) {
    // Check for OGG page header
    if (bytes[offset] !== 0x4F || bytes[offset+1] !== 0x67 || 
        bytes[offset+2] !== 0x67 || bytes[offset+3] !== 0x53) {
        break;
    }
   
    const headerType = bytes[offset+5];
    const granulePosition = readLittleEndianBigInt(bytes, offset+6, 8);
   
    // Check for first Opus header page
    if (headerType & 0x02) {
        // Look for Opus identification header
        const idHeaderStart = offset + OGG_HEADER_SIZE;
        const magicNumber = readLittleEndianUint32(bytes, idHeaderStart);
        
        if (magicNumber === OPUS_HEADER_ID) {
            // Read sample rate from Opus header
            sampleRate = readLittleEndianUint32(bytes, idHeaderStart + 12);
        }
    }
    
    // Accumulate total samples from granule position
    if (granulePosition !== 0n) {
        totalSamples = Number(granulePosition);
    }
    
    // Move to next page
    const segmentTable = bytes[offset+26];
    const segmentSizes = bytes.slice(offset+OGG_HEADER_SIZE, offset+OGG_HEADER_SIZE+segmentTable);
    const pageSize = segmentTable + OGG_HEADER_SIZE + segmentSizes.reduce((a, b) => a + b, 0);
    offset += pageSize;
  }
  return totalSamples/sampleRate
}

// Helper function to read little-endian 32-bit unsigned integer
function readLittleEndianUint32(bytes: Uint8Array, offset: number) {
    return (
        bytes[offset] | 
        (bytes[offset+1] << 8) | 
        (bytes[offset+2] << 16) | 
        (bytes[offset+3] << 24)
    ) >>> 0;
}

// Helper function to read little-endian 64-bit BigInt
function readLittleEndianBigInt(bytes: Uint8Array, offset: number, length: number) {
    let result = 0n;
    for (let i = 0; i < length; i++) {
        result |= BigInt(bytes[offset + i]) << BigInt(8 * i);
    }
    return result;
}
