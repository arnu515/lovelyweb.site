import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod/v4';
import { captureException } from '@sentry/sveltekit';

const updateDetailsSchema = z.object({
  name: z
    .string()
    .min(4, 'Name must be at least 4 characters')
    .max(36, 'Name must be at most 36 characters')
    .trim(),
  link: z.string().url('Must be a valid URL').trim().optional().or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal(''))
});

const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'basic', 'pro'], { error: 'Please select a valid plan' })
});

export const load: PageServerLoad = async ({ locals: { supabase, auth }, params }) => {
  if (!auth.session || !auth.user) redirect(303, '/auth');
  
  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', params.orgId)
    .single();
  
  if (orgError) {
    captureException(orgError, { tags: { supabase: 'organisations' } });
    error(500, { message: orgError.message });
  }
  
  if (!org) error(404, { message: 'Organization not found' });
  
  // Check if user is the owner
  if (org.owner_id !== auth.user.id) {
    error(403, { message: 'You do not have permission to access this page' });
  }

  // Check if user can downgrade to free plan
  let canDowngradeToFree = true;
  if (org.plan !== 'free') {
    const { count, error: countError } = await supabase
      .from('organisations')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', auth.user.id)
      .eq('plan', 'free');
    
    if (countError) {
      captureException(countError, { tags: { supabase: 'organisations' } });
      error(500, { message: countError.message });
    }
    
    canDowngradeToFree = count === 0;
  }

  return {
    org,
    canDowngradeToFree
  };
};

export const actions: Actions = {
  updateDetails: async ({ request, locals: { supabase, auth }, params }) => {
    if (!auth.session || !auth.user) redirect(303, '/auth');
    
    const formData = await request.formData();
    const parseResult = updateDetailsSchema.safeParse(Object.fromEntries(formData));
    
    if (!parseResult.success) {
      return fail(400, { 
        error: parseResult.error.issues[0]?.message || 'Invalid form data',
        success: ''
      });
    }
    
    const { data: body } = parseResult;
    
    // Check if user is the owner
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .select('owner_id')
      .eq('id', params.orgId)
      .single();
    
    if (orgError) {
      captureException(orgError, { tags: { supabase: 'organisations' } });
      return fail(500, { error: orgError.message, success: '' });
    }
    
    if (!org || org.owner_id !== auth.user.id) {
      return fail(403, { error: 'You do not have permission to update this organization', success: '' });
    }
    
    // Update organization
    const { error: updateError } = await supabase
      .from('organisations')
      .update({
        name: body.name,
        description: body.description || null,
        link: body.link || null
      })
      .eq('id', params.orgId);
    
    if (updateError) {
      captureException(updateError, { tags: { supabase: 'organisations' } });
      return fail(500, { error: updateError.message, success: '' });
    }
    
    return { error: '', success: 'Organization details updated successfully' };
  },
  
  updateSubscription: async ({ request, locals: { supabase, auth }, params }) => {
    if (!auth.session || !auth.user) redirect(303, '/auth');
    
    const formData = await request.formData();
    const parseResult = updateSubscriptionSchema.safeParse(Object.fromEntries(formData));
    
    if (!parseResult.success) {
      return fail(400, { 
        error: parseResult.error.issues[0]?.message || 'Invalid form data',
        success: ''
      });
    }
    
    const { data: body } = parseResult;
    
    // Check if user is the owner
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .select('owner_id, plan')
      .eq('id', params.orgId)
      .single();
    
    if (orgError) {
      captureException(orgError, { tags: { supabase: 'organisations' } });
      return fail(500, { error: orgError.message, success: '' });
    }
    
    if (!org || org.owner_id !== auth.user.id) {
      return fail(403, { error: 'You do not have permission to update this organization', success: '' });
    }
    
    // If trying to downgrade to free, check if user already has a free organization
    if (body.plan === 'free' && org.plan !== 'free') {
      const { count, error: countError } = await supabase
        .from('organisations')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', auth.user.id)
        .eq('plan', 'free');
      
      if (countError) {
        captureException(countError, { tags: { supabase: 'organisations' } });
        return fail(500, { error: countError.message, success: '' });
      }
      
      if (count > 0) {
        return fail(400, { 
          error: 'You already have an organization on the Free plan. Please upgrade that organization or delete it first.',
          success: ''
        });
      }
    }
    
    // Update subscription
    const { error: updateError } = await supabase
      .from('organisations')
      .update({
        plan: body.plan
      })
      .eq('id', params.orgId);
    
    if (updateError) {
      captureException(updateError, { tags: { supabase: 'organisations' } });
      return fail(500, { error: updateError.message, success: '' });
    }
    
    return { 
      error: '', 
      success: `Subscription updated to ${body.plan.charAt(0).toUpperCase() + body.plan.slice(1)} plan` 
    };
  }
};