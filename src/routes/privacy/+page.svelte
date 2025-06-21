<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft, Shield, Database, Eye, Lock, AlertTriangle, Server, Brain } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Privacy Policy - lovelyweb.site</title>
  <meta
    name="description"
    content="Privacy Policy for lovelyweb.site - Learn how we collect, use, and protect your data on our AI-powered communication platform."
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
  <!-- Header -->
  <div class="glass dark:glass-dark border-b border-white/20 dark:border-gray-700/50">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button
            variant="ghost"
            href="/"
            class="flex items-center space-x-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
          >
            <ArrowLeft class="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
        <div class="flex items-center space-x-2">
          <div class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Shield class="h-5 w-5 text-white" />
          </div>
          <span class="text-gradient text-xl font-bold">lovelyweb.site</span>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
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
                  <li>File attachments and shared documents</li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Usage Information
                </h3>
                <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
                  <li>How you use our features and services</li>
                  <li>Device information (browser, operating system)</li>
                  <li>IP address and general location</li>
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
              <li><strong>Security:</strong> To protect against fraud, abuse, and security threats</li>
              <li><strong>Improvements:</strong> To analyze usage patterns and improve our platform (anonymized data only)</li>
              <li><strong>Communication:</strong> To send important service updates and notifications</li>
            </ul>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>We do not:</strong> Sell your data, use it for advertising, or share it with third parties 
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
              To provide our services, we work with trusted third-party providers. Here's what they do 
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
                <p class="mb-2 text-gray-700 dark:text-gray-300">
                  <strong>Data location:</strong> Servers in the United States
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
            </div>
          </section>

          <!-- AI and Data Training -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Brain class="mr-3 h-6 w-6 text-purple-600" />
              AI Models and Data Training
            </h2>
            <div class="glass-card rounded-xl border-l-4 border-orange-500 bg-orange-50/50 p-6 dark:bg-orange-900/20">
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
                  <strong>Your control:</strong> You can choose not to use AI features if you prefer to keep your 
                  data from being processed by AI providers. All core functionality works without AI.
                </p>
                <p>
                  <strong>Our commitment:</strong> We only send the minimum necessary data to AI providers and 
                  work with reputable companies that have strong privacy practices.
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
                  <li>Regular security audits and monitoring</li>
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
                    <strong>Why:</strong> This allows us to provide AI-powered features, search, and 
                    organization tools. End-to-end encryption would prevent these features from working.
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
              <li><strong>Business transfer:</strong> If we're acquired or merged, your data may transfer to the new entity</li>
              <li><strong>Team members:</strong> Within your organisation, as configured by your organisation settings</li>
            </ul>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>We never:</strong> Sell your data to advertisers, marketers, or data brokers.
            </p>
          </section>

          <!-- Your Rights -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Your Privacy Rights
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              You have several rights regarding your personal information:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format (coming soon)</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
            </ul>
            <p class="text-gray-700 dark:text-gray-300">
              To exercise these rights, contact us at <a href="mailto:privacy@lovelyweb.site">privacy@lovelyweb.site</a>. 
              We'll respond within 30 days.
            </p>
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
                <strong>Backup data:</strong> Some data may remain in our backup systems for up to 90 days 
                after deletion for disaster recovery purposes.
              </p>
              <p>
                <strong>Legal requirements:</strong> We may retain some data longer if required by law, 
                such as for tax or legal compliance.
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
                Our services are primarily hosted in the United States. If you're located outside 
                the US, your data will be transferred to and processed in the United States.
              </p>
              <p>
                We ensure appropriate safeguards are in place for international transfers, including 
                working with service providers that comply with international privacy frameworks.
              </p>
            </div>
          </section>

          <!-- Children's Privacy -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Children's Privacy
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Our service is not intended for children under 18. We do not knowingly collect 
                personal information from children under 18.
              </p>
              <p>
                If you believe we have collected information from a child under 18, please contact 
                us immediately at <a href="mailto:privacy@lovelyweb.site">privacy@lovelyweb.site</a> 
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
              <p>
                Significant changes will be communicated at least 30 days in advance. Continued use 
                of our service after changes means you accept the updated policy.
              </p>
            </div>
          </section>

          <!-- Contact Information -->
          <section class="mb-8">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Contact Us About Privacy
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                If you have questions about this privacy policy or how we handle your data, 
                please contact us:
              </p>
              <ul class="list-disc pl-6">
                <li>Privacy Email: <a href="mailto:privacy@lovelyweb.site">privacy@lovelyweb.site</a></li>
                <li>General Support: <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a></li>
                <li>Website: <a href="/">lovelyweb.site</a></li>
              </ul>
              <p>
                We're committed to addressing your privacy concerns and will respond to your 
                inquiries within 30 days.
              </p>
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