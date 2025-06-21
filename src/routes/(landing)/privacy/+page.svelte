<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Shield, Database, Eye, Lock, AlertTriangle, Server, Brain, Users } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Privacy Policy - lovelyweb.site</title>
  <meta
    name="description"
    content="Privacy Policy for lovelyweb.site - Learn how we collect, use, and protect your data on our AI-powered communication platform."
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <div class="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <!-- Page Header -->
      <div class="mb-12 text-center">
        <div class="gradient-primary mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Shield class="h-10 w-10 text-white" />
        </div>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          Privacy Policy
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Last updated: January 2025
        </p>
      </div>

      <!-- Privacy Content -->
      <div class="glass dark:glass-dark rounded-2xl p-8 md:p-12">
        <div class="prose prose-lg max-w-none dark:prose-invert">
          <!-- Introduction -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Eye class="mr-3 h-6 w-6 text-purple-600" />
              Your Privacy Matters
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              At lovelyweb.site, we believe your privacy is fundamental. This Privacy Policy explains 
              how we collect, use, and protect your personal information when you use our service.
            </p>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              We've written this policy in plain English to make it easy to understand. 
              If you have questions, please contact us at <a href="mailto:privacy@lovelyweb.site">privacy@lovelyweb.site</a>.
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>Our commitment:</strong> We only collect and use your data to provide you with 
              our services. We do not sell your personal information to third parties.
            </p>
          </section>

          <!-- What We Collect -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Database class="mr-3 h-6 w-6 text-purple-600" />
              What Information We Collect
            </h2>
            <div class="space-y-6">
              <div>
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h3>
                <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>Email address (required for account creation)</li>
                  <li>Name and username</li>
                  <li>Profile picture (if provided)</li>
                  <li>Organisation details (name, description, website)</li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Communication Data
                </h3>
                <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>Emails you send and receive through our platform</li>
                  <li>Chat messages and conversations</li>
                  <li>Meeting recordings and transcripts (when enabled)</li>
                  <li>Notes, tasks, and other content you create</li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Usage Information (powered by Sentry)
                </h3>
                <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>Device information (browser, operating system)</li>
                  <li>IP address</li>
                  <li>Login times and activity patterns</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- How We Use Your Data -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              How We Use Your Information
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              We use your information solely to provide and improve our services:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li><strong>Service Delivery:</strong> To provide email management, chat, and collaboration features</li>
              <li><strong>AI Features:</strong> To power intelligent organization, summarization, and productivity tools</li>
              <li><strong>Account Management:</strong> To maintain your account and provide customer support</li>
              <li><strong>Communication:</strong> To send important emails regarding your organisation</li>
            </ul>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>We do not and will not sell your data</strong>, use it for advertising, or share it with third parties 
              except as described in this policy.
            </p>
          </section>

          <!-- Third-Party Services -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Server class="mr-3 h-6 w-6 text-purple-600" />
              Third-Party Services We Use
            </h2>
            <p class="mb-6 text-gray-700 dark:text-gray-300">
              To provide our services, we work with some third-party providers. Here's what they do 
              and how they handle your data:
            </p>
            
            <div class="space-y-6">
              <div class="glass-card rounded-xl border-l-4 border-blue-500 bg-blue-50/50 p-6 dark:bg-blue-900/20">
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Supabase (Backend & Database)
                </h3>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>What they do:</strong> Store your account data, messages, and files
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Privacy:</strong> <a href="https://supabase.com/privacy">Supabase Privacy Policy</a>
                </p>
              </div>

              <div class="glass-card rounded-xl border-l-4 border-green-500 bg-green-50/50 p-6 dark:bg-green-900/20">
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Netlify (Website Hosting)
                </h3>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>What they do:</strong> Host our website and handle web traffic
                </p>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>Data collected:</strong> Basic web analytics (IP addresses, page views)
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Privacy:</strong> <a href="https://www.netlify.com/privacy/">Netlify Privacy Policy</a>
                </p>
              </div>

              <div class="glass-card rounded-xl border-l-4 border-purple-500 bg-purple-50/50 p-6 dark:bg-purple-900/20">
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Paddle & RevenueCat (Payment Processing)
                </h3>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>What they do:</strong> Process subscription payments and manage billing
                </p>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>Data collected:</strong> Payment information, billing addresses, transaction history
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Privacy:</strong> <a href="https://paddle.com/privacy/">Paddle Privacy Policy</a> | 
                  <a href="https://www.revenuecat.com/privacy/">RevenueCat Privacy Policy</a>
                </p>
              </div>

              <div class="glass-card rounded-xl border-l-4 border-amber-500 bg-amber-50/50 p-6 dark:bg-amber-900/20">
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Sentry (Analytics and Error-reporting)
                </h3>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>What they do:</strong> Collect errors and insights from your browser and our servers.
                </p>
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>How to disable:</strong> Browser analytics may be disabled by using a tracker blocker.
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  <strong>Privacy:</strong> <a href="https://sentry.io/privacy/">Sentry Privacy Policy</a>
                </p>
              </div>
            </div>
          </section>

          <!-- AI and Data Training -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Brain class="mr-3 h-6 w-6 text-purple-600" />
              AI Models and Data Training
            </h2>
            <div class="glass-card rounded-xl border-l-4 border-fuchsia-500 bg-fuchsia-50/50 p-6 dark:bg-fuchsia-900/20">
              <p class="mb-4 text-gray-700 dark:text-gray-300">
                <strong>Important Notice:</strong> Our AI features are powered by third-party AI model providers. 
                When you use AI features, your content may be sent to these providers for processing.
              </p>
              <div class="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>What this means:</strong> AI providers may use your data to train and improve their models. 
                  This could include your emails, chat messages, and other content you process through AI features.
                </p>
                <p>
                  <strong>This part will be updated as we iron out our choices in AI models and providers.</strong>
                </p>
              </div>
            </div>
          </section>

          <!-- Security and Encryption -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Lock class="mr-3 h-6 w-6 text-purple-600" />
              Security and Encryption
            </h2>
            <div class="space-y-6">
              <div>
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  What We Protect
                </h3>
                <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>All data transmission is encrypted using HTTPS/TLS</li>
                  <li>Account passwords are securely hashed and never stored in plain text</li>
                  <li>We use industry-standard security practices to protect our systems</li>
                </ul>
              </div>

              <div class="glass-card rounded-xl border-l-4 border-red-500 bg-red-50/50 p-6 dark:bg-red-900/20">
                <h3 class="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <AlertTriangle class="mr-2 h-5 w-5 text-red-600" />
                  Important Security Notice
                </h3>
                <div class="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Not End-to-End Encrypted:</strong> Your emails and chat messages are not 
                    end-to-end encrypted. This means we can technically access your content if needed 
                    for service operation or legal compliance.
                  </p>
                  <p>
                    <strong>Not Encrypted at Rest:</strong> Your data is not encrypted when stored in 
                    our databases. While we use secure infrastructure and access controls, the data 
                    itself is stored in readable format.
                  </p>
                  <p>
                    <strong>Why:</strong> This application was built in a hackathon in 10 days. If you
                    need encryption or end-to-end encryption, please reach out to us at
                    <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Data Sharing -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              When We Share Your Data
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              We only share your personal information in these limited circumstances:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
              <li><strong>Service providers:</strong> With the third-party services listed above to operate our platform</li>
              <li><strong>Legal requirements:</strong> When required by law, court order, or to protect rights and safety</li>
              <li><strong>Team members:</strong> Within your organisation, as configured by your organisation settings</li>
            </ul>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>We never sell your data to advertisers, marketers, or data brokers.</strong>
            </p>
          </section>

          <!-- Your Rights -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Your Privacy Rights
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              You may:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li><strong>Correct:</strong> Update or correct inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format (coming soon)</li>
            </ul>
          </section>

          <!-- Data Retention -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              How Long We Keep Your Data
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Active accounts:</strong> We keep your data as long as your account is active 
                and you're using our services.
              </p>
              <p>
                <strong>Deleted accounts:</strong> When you delete your account, we remove your personal 
                data within 30 days, except where we're required by law to keep it longer.
              </p>
              <p>
                <strong>Legal requirements:</strong> We may retain some data longer if required by law.
              </p>
            </div>
          </section>

          <!-- International Transfers -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              International Data Transfers
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Our services are hosted by third parties in the following regions:
              </p>
              <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                <li><strong>Supabase (Main Database and Files):</strong> In the USA</li>
                <li><strong>Netlify (Hosting):</strong> Worldwide (caching) and in the USA (functions)</li>
                <li><strong>DigitalOcean (Email Server):</strong> In the USA. Emails are placed here temporarily for processing.</li>
                <li><strong>Sentry (Analytics):</strong> In the EU</li>
              </ul>
              <p>
                Please email us at
                <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a>
                for any queries.
              </p>
            </div>
          </section>

          <!-- Children's Privacy -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Children
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Our service is not intended for children</strong>. We define a child as a person
                under the age of majority in their jurisdiction (commonly 18). We do not knowingly collect 
                personal information from children.
              </p>
              <p>
                If you believe we have collected information from a child, please contact us immediately at
                <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a> 
                and we will delete it.
              </p>
            </div>
          </section>

          <!-- Changes to Privacy Policy -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Changes to This Privacy Policy
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We may update this privacy policy from time to time. When we do, we'll notify you 
                by email and update the "Last updated" date at the top of this page.
              </p>
            </div>
          </section>

          <!-- Contact Information -->
          <section class="mb-8">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Users class="mr-3 h-6 w-6 text-purple-600" />
              Contact Us
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                If you have questions about this privacy policy or how we handle your data, 
                please contact us:
              </p>
              <ul class="list-disc pl-6">
                <li>Email: <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a></li>
                <li>Website: <a href="/">lovelyweb.site</a></li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-12 text-center">
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="outline"
            href="/"
            class="glass dark:glass-dark border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
          >
            Back to Home
          </Button>
          <Button
            href="/auth"
            class="gradient-primary text-white transition-transform duration-200 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  a {
    @apply text-purple-600 hover:underline dark:text-purple-400;
  }
</style>
