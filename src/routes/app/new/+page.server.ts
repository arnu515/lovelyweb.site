import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';

const organisationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal(''))
});

const planSchema = z.object({
  plan: z.enum(['free', 'basic', 'pro'], { required_error: 'Please select a plan' })
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

function generateRandomSuffix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const load: PageServerLoad = async ({ locals: { auth } }) => {
  if (!auth.session || !auth.user) {
    redirect(303, '/auth');
  }
  return {};
};

export const actions: Actions = {
  checkSlug: async ({ request, locals: { supabase } }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString() || '';
    
    if (!name.trim()) {
      return fail(400, { error: 'Name is required' });
    }

    let slug = generateSlug(name);
    if (!slug) {
      return fail(400, { error: 'Invalid organisation name' });
    }

    // Check if slug exists
    const { data: existing } = await supabase
      .from('organisations')
      .select('id')
      .eq('id', slug)
      .single();

    if (existing) {
      // Generate unique slug with suffix
      let attempts = 0;
      let uniqueSlug = slug;
      
      while (attempts < 10) {
        const suffix = generateRandomSuffix();
        uniqueSlug = `${slug}-${suffix}`;
        
        const { data: existingWithSuffix } = await supabase
          .from('organisations')
          .select('id')
          .eq('id', uniqueSlug)
          .single();
        
        if (!existingWithSuffix) {
          break;
        }
        attempts++;
      }
      
      if (attempts >= 10) {
        return fail(500, { error: 'Unable to generate unique organisation ID' });
      }
      
      slug = uniqueSlug;
    }

    return { slug, available: !existing };
  },

  createOrganisation: async ({ request, locals: { supabase, auth } }) => {
    if (!auth.session || !auth.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const form = await request.formData();
    const step = form.get('step')?.toString();

    if (step === 'details') {
      const orgData = {
        name: form.get('name')?.toString() || '',
        link: form.get('link')?.toString() || '',
        description: form.get('description')?.toString() || ''
      };

      const validation = organisationSchema.safeParse(orgData);
      if (!validation.success) {
        return fail(400, {
          step: 'details',
          error: validation.error.issues[0]?.message || 'Invalid input',
          ...orgData
        });
      }

      // Generate and check slug
      let slug = generateSlug(validation.data.name);
      if (!slug) {
        return fail(400, {
          step: 'details',
          error: 'Invalid organisation name',
          ...orgData
        });
      }

      const { data: existing } = await supabase
        .from('organisations')
        .select('id')
        .eq('id', slug)
        .single();

      if (existing) {
        let attempts = 0;
        let uniqueSlug = slug;
        
        while (attempts < 10) {
          const suffix = generateRandomSuffix();
          uniqueSlug = `${slug}-${suffix}`;
          
          const { data: existingWithSuffix } = await supabase
            .from('organisations')
            .select('id')
            .eq('id', uniqueSlug)
            .single();
          
          if (!existingWithSuffix) {
            break;
          }
          attempts++;
        }
        
        if (attempts >= 10) {
          return fail(500, {
            step: 'details',
            error: 'Unable to generate unique organisation ID',
            ...orgData
          });
        }
        
        slug = uniqueSlug;
      }

      return {
        step: 'pricing',
        slug,
        ...validation.data
      };
    }

    if (step === 'pricing') {
      const planData = {
        plan: form.get('plan')?.toString() || ''
      };

      const planValidation = planSchema.safeParse(planData);
      if (!planValidation.success) {
        return fail(400, {
          step: 'pricing',
          error: 'Please select a plan',
          name: form.get('name')?.toString() || '',
          link: form.get('link')?.toString() || '',
          description: form.get('description')?.toString() || '',
          slug: form.get('slug')?.toString() || ''
        });
      }

      // Create organisation
      const orgData = {
        id: form.get('slug')?.toString() || '',
        name: form.get('name')?.toString() || '',
        link: form.get('link')?.toString() || null,
        description: form.get('description')?.toString() || null,
        plan: planValidation.data.plan,
        owner_id: auth.user.id
      };

      const { error } = await supabase
        .from('organisations')
        .insert(orgData);

      if (error) {
        return fail(500, {
          step: 'pricing',
          error: error.message,
          name: orgData.name,
          link: orgData.link || '',
          description: orgData.description || '',
          slug: orgData.id
        });
      }

      redirect(303, `/app/org/${orgData.id}`);
    }

    return fail(400, { error: 'Invalid step' });
  }
};