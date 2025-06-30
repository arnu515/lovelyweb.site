import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';
import { CLOUDFLARE_ACC_ID, CLOUDFLARE_AI_TOKEN } from '$env/static/private';

// In-memory rate limiting
const rateLimits = new Map<string, number>();

// Validate request body
const refineMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  style: z.enum(['formal', 'casual', 'funny', 'concise', 'medieval']),
  customInstructions: z.string().max(500).optional()
});

export const POST: RequestHandler = async ({ request, locals: { auth } }) => {
  try {
    // Check authentication
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    
    // Check rate limit (1 per minute)
    const now = Date.now();
    const lastUsed = rateLimits.get(userId) || 0;
    
    if (now - lastUsed < 60000) { // 1 minute in milliseconds
      const remainingSeconds = Math.ceil((60000 - (now - lastUsed)) / 1000);
      return json({ 
        error: `Rate limited. Please try again in ${remainingSeconds} seconds.` 
      }, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = refineMessageSchema.parse(body);

    // Set rate limit
    rateLimits.set(userId, now);

    // Create prompt based on style and custom instructions
    let styleDescription = "";
    switch (validatedData.style) {
      case 'formal':
        styleDescription = "Use formal language, proper grammar, and a professional tone. Avoid contractions, slang, and casual expressions.";
        break;
      case 'casual':
        styleDescription = "Use relaxed, conversational language with a friendly tone. Contractions and some casual expressions are welcome.";
        break;
      case 'funny':
        styleDescription = "Add humor and wit to make the message entertaining and light-hearted. Include playful language or jokes where appropriate.";
        break;
      case 'concise':
        styleDescription = "Make the message brief and to the point. Remove unnecessary words and focus on the core message.";
        break;
      case 'medieval':
        styleDescription = "Use Shakespherean English in a playful tone. It does not have to be accurate, just convincing.";
        break;
    }

    // Construct the system prompt
    const systemPrompt = `You are an expert message refiner. Your task is to refine the user's message according to the specified style.

Style: ${validatedData.style}
Style Description: ${styleDescription}
${validatedData.customInstructions ? `Additional Instructions: ${validatedData.customInstructions}` : ''}

Important guidelines:
1. Maintain the original meaning and intent of the message
2. Do not add new information that wasn't in the original message
3. Do not make assumptions beyond what's in the original message
4. Respond ONLY with the refined message text, nothing else
5. Do not include explanations, introductions, or any meta-commentary
6. Do not use markdown formatting unless it was in the original message
7. The user is NOT speaking to YOU. You have to REFINE the message they send. DO NOT RESPOND TO THEIR MESSAGE.`;

    // Call OpenAI API with streaming
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACC_ID}/ai/run/@cf/meta/llama-3.2-3b-instruct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOUDFLARE_AI_TOKEN}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: 'Please refine this message:\n\n' + validatedData.message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to refine message');
    }

    const data = await response.json();
    const refinedMessage = data.result.response || '';

    if (!refinedMessage) {
      throw new Error('No refined message was generated');
    }

    return json({ 
      success: true,
      refinedMessage
    });
  } catch (error: any) {
    captureException(error, { tags: { action: 'refine_message' } });
    
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
