<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft, Scale, Shield, CreditCard, Users, Coins } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Terms of Service - lovelyweb.site</title>
  <meta
    name="description"
    content="Terms of Service for lovelyweb.site - AI-powered communication platform. Learn about our policies, user responsibilities, and refund terms."
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
            <Scale class="h-5 w-5 text-white" />
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
          <Scale class="h-10 w-10 text-white" />
        </div>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
          Terms of Service
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Last updated: January 2025
        </p>
      </div>

      <!-- Terms Content -->
      <div class="glass dark:glass-dark rounded-2xl p-8 md:p-12">
        <div class="prose prose-lg max-w-none dark:prose-invert">
          <!-- Introduction -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Shield class="mr-3 h-6 w-6 text-purple-600" />
              Welcome to lovelyweb.site
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              These Terms of Service ("Terms") govern your use of lovelyweb.site ("we", "us", or "our") 
              and the services we provide. By using our platform, you agree to these terms.
            </p>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              We've written these terms in plain English to make them easy to understand. 
              If you have questions, please contact us at <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a>.
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              Please note that lovelyweb.site is in its infancy and was built for a <a href="https://hackathon.dev">hackathon</a>.
              As such, the longevity and future of this service is not guaranteed. It will be shut down after the hackathon's
              judging period if there are no paying users. If you want to use this service for your organisation for a longer
              period, please contact me at <a href="mailto:support@lovelyweb.site">support@lovelyweb.site</a> and we can work
              something out.
            </p>
          </section>

          <!-- What We Provide -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              What We Provide
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              lovelyweb.site is an AI-powered communication platform that helps teams organize 
              their email, chat, and meeting workflows. Our services include:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li>Email management and organization</li>
              <li>Team chat and video conferencing</li>
              <li>Notes, Todos, and Kanbans</li>
              <li>AI-powered features for productivity</li>
            </ul>
          </section>

          <!-- Your Account -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Your Account
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Account Creation:</strong> Upon creating an account, you agree to
                these Terms as presented here.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 18 years old, or the age of
                "majority" in your jurisdiction to use our service. 
              </p>
              <p>
                <strong>Organisation Accounts:</strong> When you create an organisation, you become 
                the owner and are responsible for managing team members and billing.
              </p>
            </div>
          </section>

          <!-- What You Can Do -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              What You Can Do
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              You're welcome to use lovelyweb.site for legitimate business and personal communication needs:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li>Organize and manage your team's communications</li>
              <li>Use our AI features to improve productivity</li>
              <li>Invite team members to your organisation</li>
              <li>Export your data at any time (coming soon)</li>
            </ul>
          </section>

          <!-- What You Cannot Do -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              What You Cannot Do
            </h2>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              To keep our platform safe for everyone, you are not allowed to:
            </p>
            <ul class="mb-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
              <li>Use our service for illegal activities or spam</li>
              <li>Share harmful, offensive, or inappropriate content</li>
              <li>Try to hack, disrupt, or damage our systems</li>
              <li>Share your account credentials with others</li>
              <li>Use our service to compete with us directly</li>
              <li>Violate others' privacy or intellectual property rights</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Attempt to bypass any limits set on your account</li>
            </ul>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              Performing such actions may entail a permanent suspension of your account, including your
              organisation and its members. Creating another account after your account has already been
              suspended without our prior permission is not permitted.
            </p>
          </section>

          <!-- Your Data -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Your Data and Privacy
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Your Content:</strong> You own the content you upload to our platform. 
                We only use it to provide our services to you.
              </p>
              <p>
                <strong>Data Export:</strong> (coming soon) You can export your data at any time.
                If you delete your account, we'll remove your data within 30 days.
              </p>
              <p>
                Read our <a href="/privacy">privacy policy</a> to learn more about your Privacy on lovelyweb.site.
              </p>
            </div>
          </section>

          <!-- Billing and Payments -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <CreditCard class="mr-3 h-6 w-6 text-purple-600" />
              Billing and Payments
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Free Plan:</strong> Our free plan is available indefinitely with 
                usage limits. No payment required. You may only create one organisation
                on the Free plan.
              </p>
              <p>
                <strong>Paid Plans:</strong> Paid subscriptions are billed monthly in advance.
                Prices are shown in USD and may change.
              </p>
              <p>
                <strong>Auto-Renewal:</strong> Subscriptions can be made to automatically renew.
              </p>
              <p>
                <strong>Cancellations:</strong> Subscriptions can be cancelled at any time before
                the renewal date (if auto-renew is enabled). The existing subscription continues
                until its expiration.
              </p>
              <p>You may not create another organisation on the free plan if you already have one
              on the free plan. Additionally, you may not create another organisation on the free
              plan if you've set your subscription to not auto-renew. To cancel a subscription,
              you must not have any other organisation on the free plan.</p>
            </div>
          </section>

          <!-- Refund Policy -->
          <section class="mb-12">
            <h2 class="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
              <Coins class="mr-3 h-6 w-6 text-purple-600" />
              Refund Policy
            </h2>
            <div class="glass-card rounded-xl border-l-4 border-purple-500 bg-purple-50/50 p-6 dark:bg-purple-900/20">
              <div class="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>No Refunds:</strong> We do not offer refunds for subscription payments 
                  once they have been processed. This includes monthly and annual subscriptions.
                </p>
                <p>
                  <strong>Cancellation:</strong> You can cancel your subscription at any time 
                  from your account settings. When you cancel:
                </p>
                <ul class="list-disc pl-6">
                  <li>Your subscription will not auto-renew</li>
                  <li>You'll continue to have access until your subscription ends</li>
                  <li>Your account will automatically downgrade to the free plan</li>
                  <li>Your data will be preserved according to free plan limits</li>
                </ul>
                <p>
                  <strong>Exceptional Circumstances:</strong> In rare cases involving technical 
                  issues on our end that prevent service usage, we may offer prorated credits 
                  or refunds at our discretion.
                </p>
              </div>
            </div>
          </section>

          <!-- Service Availability -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Service Availability
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We strive to keep our service available 24/7, but we can't guarantee 100% uptime. 
              </p>
              <p>
                <strong>This service may be shut down after the hackathon judging period ends if
                there are no paid users (since I won't be able to sustain it.)</strong>
              </p>
            </div>
          </section>

          <!-- Termination -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Account Termination
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Your Right to Terminate:</strong> You can delete your account at any 
                time from your account settings.
              </p>
              <p>
                <strong>Our Right to Terminate:</strong> We may suspend or terminate accounts 
                that violate these terms, but we'll try to contact you first when possible.
              </p>
              <p>
                <strong>Data After Termination:</strong> We'll delete your data within 30 days 
                of account termination, except where required by law to retain it longer.
              </p>
            </div>
          </section>

          <!-- Limitation of Liability -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Limitation of Liability
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                THIS SERVICE IS PROVIDED "AS IS" WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </p>
              <!-- TODO: <p>
                The software's source code is additionally licensed under the GNU GPLv3 and is available <a href="https://github.com/arnu515/lovelyweb.site">here</a>. 
              </p> -->
            </div>
          </section>

          <!-- Changes to Terms -->
          <section class="mb-12">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Changes to These Terms
            </h2>
            <div class="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We may update these terms occasionally. When we do, we'll notify you by email 
                and update the "Last updated" date at the top of this page.
              </p>
              <p>
                Continued use of our service after changes means you accept the new terms. 
                If you don't agree with changes, you can delete your account.
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
                If you have questions about these terms or our service, please contact us:
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
