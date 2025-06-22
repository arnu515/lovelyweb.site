import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'lovelywebsite',
        project: 'website',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      }
    }),
    sveltekit()
  ]
});
