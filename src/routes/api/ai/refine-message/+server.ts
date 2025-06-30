import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';

// In-memory rate limiting
const rateLimits = new Map<string, number>();

// Validate request body
const refineMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  style: z.enum(['formal', 'casual', 'funny', 'concise', 'professional']),
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
    let prompt = `Refine the following message to make it more ${validatedData.style}`;
    
    if (validatedData.customInstructions) {
      prompt += `. Additional instructions: ${validatedData.customInstructions}`;
    }
    
    prompt += `.\n\nOriginal message: "${validatedData.message}"\n\nRefined message:`;

    // For now, we'll simulate an AI response
    // In a real implementation, you would call OpenRouter API here
    const simulatedResponse = simulateAIRefine(validatedData.message, validatedData.style);
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return json({ 
      success: true,
      refinedMessage: simulatedResponse
    });

  } catch (error: any) {
    captureException(error, { tags: { action: 'refine_message' } });
    
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

// Simulate AI refinement (to be replaced with actual OpenRouter API call)
function simulateAIRefine(message: string, style: string): string {
  const styles: Record<string, (msg: string) => string> = {
    formal: (msg) => {
      const words = msg.split(' ');
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + '.';
    },
    casual: (msg) => msg + " 😊",
    funny: (msg) => msg + " 😂 LOL!",
    concise: (msg) => {
      const words = msg.split(' ');
      return words.slice(0, Math.max(5, Math.floor(words.length * 0.7))).join(' ');
    },
    professional: (msg) => "I would like to inform you that " + msg
  };

  return styles[style](message);
}