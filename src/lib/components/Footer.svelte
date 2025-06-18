<script lang="ts">
	import { Mail, MessageCircle, Twitter, Linkedin, Github, Heart } from "lucide-svelte";

	const navigation = {
		product: [
			{ name: 'Features', href: '#features' },
			{ name: 'Pricing', href: '#pricing' },
			{ name: 'Security', href: '#' },
			{ name: 'Integrations', href: '#' }
		],
		company: [
			{ name: 'About', href: '#about' },
			{ name: 'Blog', href: '#' },
			{ name: 'Careers', href: '#' },
			{ name: 'Press', href: '#' }
		],
		support: [
			{ name: 'Help Centre', href: '#' },
			{ name: 'Community', href: '#' },
			{ name: 'Contact', href: '#contact' },
			{ name: 'Status', href: '#' }
		],
		legal: [
			{ name: 'Privacy', href: '#' },
			{ name: 'Terms', href: '#' },
			{ name: 'Cookies', href: '#' },
			{ name: 'GDPR', href: '#' }
		]
	};

	const social = [
		{ name: 'Twitter', href: '#', icon: Twitter },
		{ name: 'LinkedIn', href: '#', icon: Linkedin },
		{ name: 'GitHub', href: '#', icon: Github }
	];
</script>

<footer class="bg-gray-900 text-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
			<!-- Brand -->
			<div class="lg:col-span-2">
				<div class="flex items-center space-x-2 mb-4">
					<div class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
						<Mail class="w-5 h-5 text-white" />
					</div>
					<span class="text-xl font-bold text-gradient">lovelyweb.site</span>
				</div>
				<p class="text-gray-400 mb-6 max-w-sm">
					Unify your communication workflow with AI-powered email, chat, and meeting management.
				</p>
				<div class="flex space-x-4">
					{#each social as item}
						<a
							href={item.href}
							class="w-10 h-10 rounded-full glass dark:glass-dark flex items-center justify-center hover:scale-110 transition-transform duration-200"
						>
							<svelte:component this={item.icon} class="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-200" />
						</a>
					{/each}
				</div>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Product</h3>
				<ul class="space-y-3">
					{#each navigation.product as item}
						<li>
							<a href={item.href} class="text-gray-400 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Company</h3>
				<ul class="space-y-3">
					{#each navigation.company as item}
						<li>
							<a href={item.href} class="text-gray-400 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Support -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Support</h3>
				<ul class="space-y-3">
					{#each navigation.support as item}
						<li>
							<a href={item.href} class="text-gray-400 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h3 class="text-lg font-semibold mb-4">Legal</h3>
				<ul class="space-y-3">
					{#each navigation.legal as item}
						<li>
							<a href={item.href} class="text-gray-400 hover:text-white transition-colors duration-200">
								{item.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Newsletter -->
		<div class="border-t border-gray-800 pt-8 mt-12">
			<div class="max-w-2xl">
				<h3 class="text-lg font-semibold mb-4">Stay updated</h3>
				<p class="text-gray-400 mb-4">
					Get the latest updates on new features, product announcements, and communication tips.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 max-w-md">
					<input
						type="email"
						placeholder="Enter your email"
						class="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
					<button class="gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
						Subscribe
					</button>
				</div>
			</div>
		</div>

		<!-- Bottom -->
		<div class="border-t border-gray-800 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center">
			<p class="text-gray-400 text-sm">
				© 2024 lovelyweb.site. All rights reserved.
			</p>
			<p class="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
				Made with <Heart class="w-4 h-4 text-red-500 mx-1" /> in the UK
			</p>
		</div>
	</div>
</footer>