<script lang="ts">
  import { Mail, Twitter, Linkedin, Github, Heart } from 'lucide-svelte';

  const navigation = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'About', href: '/#about' },
      { name: 'The Author', href: 'https://aarnavpai.in' }
    ],
    support: [
      { name: 'Contact', href: 'mailto:support@lovelyweb.site' },
      { name: 'Source Code', href: 'https://github.com/arnu515/lovelyweb.site' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' }
    ]
  };

  const social = [
    {
      name: 'GitHub',
      href: 'https://github.com/arnu515/lovelyweb.site',
      icon: Github
    }
  ];
</script>

<footer class="bg-gray-900 text-white">
  <div class="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
      <!-- Brand -->
      <div class="lg:col-span-2">
        <div class="mb-4 flex items-center space-x-2">
          <div
            class="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <Mail class="h-5 w-5 text-white" />
          </div>
          <span class="text-gradient text-xl font-bold">lovelyweb.site</span>
        </div>
        <p class="mb-6 max-w-sm text-gray-400">
          Unify your communication workflow with AI-powered email, chat, and meeting
          management.
        </p>
        <div class="flex space-x-4">
          {#each social as item}
            <a
              href={item.href}
              class="glass dark:glass-dark flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
            >
              <svelte:component
                this={item.icon}
                class="h-5 w-5 text-gray-400 transition-colors duration-200 hover:text-white"
              />
            </a>
          {/each}
        </div>
      </div>

      <!-- Product -->
      <div>
        <h3 class="mb-4 text-lg font-semibold">Product</h3>
        <ul class="space-y-3">
          {#each navigation.product as item}
            <li>
              <a
                href={item.href}
                class="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h3 class="mb-4 text-lg font-semibold">Support</h3>
        <ul class="space-y-3">
          {#each navigation.support as item}
            <li>
              <a
                href={item.href}
                class="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="mb-4 text-lg font-semibold">Legal</h3>
        <ul class="space-y-3">
          {#each navigation.legal as item}
            <li>
              <a
                href={item.href}
                class="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {item.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Bottom -->
    <div
      class="mt-12 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row"
    >
      <p class="text-sm text-gray-400">
        © 2024 lovelyweb.site. All rights reserved.
      </p>
      <p class="mt-4 flex items-center gap-1 text-sm text-gray-400 md:mt-0">
        Made with <Heart class="h-4 w-4 text-red-500" /> for the
        <a
          href="https://hackathon.dev"
          class="text-purple-600 hover:underline dark:text-purple-400"
          >World's Largest Hackathon</a
        >
      </p>
    </div>
  </div>
</footer>
