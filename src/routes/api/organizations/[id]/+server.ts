import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BlobServiceClient } from '@azure/storage-blob';
import { AZURE_STORAGE_CONNECTION_STRING } from '$env/static/private';
import { captureException } from '@sentry/sveltekit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

export const DELETE: RequestHandler = async ({ params, locals: { auth } }) => {
  try {
    if (!auth.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = params.id;

    // Check if user is the owner of the organization
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    if (orgError) {
      captureException(orgError, { tags: { supabase: 'organisations' } });
      return json({ error: 'Organization not found' }, { status: 404 });
    }

    if (org.owner_id !== auth.user.id) {
      return json({ error: 'You do not have permission to delete this organization' }, { status: 403 });
    }

    // Delete voice messages from Azure Blob Storage
    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      const containerClient = blobServiceClient.getContainerClient('voice-messages');
      
      // List all blobs with the organization ID prefix
      let blobs = containerClient.listBlobsFlat({ prefix: orgId + '/' });
      
      // Delete each blob
      for await (const blob of blobs) {
        await containerClient.deleteBlob(blob.name);
      }
    } catch (error) {
      // Log the error but continue with database deletion
      console.error('Failed to delete voice messages from Azure:', error);
      captureException(error, { tags: { action: 'delete_org_voice_messages' } });
    }

    // Delete the organization from the database
    // This will cascade to all related data due to foreign key constraints
    const { error: deleteError } = await supabase
      .from('organisations')
      .delete()
      .eq('id', orgId);

    if (deleteError) {
      captureException(deleteError, { tags: { supabase: 'organisations_delete' } });
      return json({ error: deleteError.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (error: any) {
    captureException(error, { tags: { action: 'delete_organization' } });
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};
