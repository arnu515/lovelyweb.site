<script lang="ts">
	import { Brain, Mail, MessageCircle, Video, FileText, Zap, Shield, Globe } from "lucide-svelte";

	const features = [
		{
			icon: Brain,
			title: "AI-Powered Email Management",
			description: "Smart summarisation, automated prioritisation, and intelligent draft generation keep your inbox organised and efficient.",
			gradient: "from-purple-500 to-pink-500"
		},
		{
			icon: MessageCircle,
			title: "Integrated Team Chat",
			description: "Real-time communication with AI-assisted translation, conversation summarisation, and automated meeting notes.",
			gradient: "from-blue-500 to-cyan-500"
		},
		{
			icon: Video,
			title: "Seamless Meeting Platform",
			description: "Integrated video conferencing with AI-driven transcription, action item capture, and automatic follow-ups.",
			gradient: "from-indigo-500 to-purple-500"
		},
		{
			icon: FileText,
			title: "Centralised Knowledge Base",
			description: "Connect all your documents, wikis, and shared resources with intelligent AI search and organisation.",
			gradient: "from-green-500 to-teal-500"
		},
		{
			icon: Zap,
			title: "Automated Workflows",
			description: "Create custom automation rules that handle routine tasks, schedule follow-ups, and manage priorities.",
			gradient: "from-yellow-500 to-orange-500"
		},
		{
			icon: Shield,
			title: "Enterprise Security",
			description: "Bank-level encryption, compliance-ready features, and advanced security controls for peace of mind.",
			gradient: "from-red-500 to-pink-500"
		}
	];
</script>

<section id="features" class="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
	<!-- Background Pattern -->
	<div class="absolute inset-0 bg-grid-gray-100 dark:bg-grid-gray-800 opacity-50"></div>
	
	<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">
				<span class="text-gradient">Powerful Features</span>
				<br />
				for Modern Teams
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
				Join thousands of teams already using lovelyweb.site to streamline their communication.
			</p>
		</div>

		<!-- Features Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature, index}
				<div class="group glass dark:glass-dark rounded-2xl p-8 hover:scale-105 transition-all duration-300 animate-slide-up" style="animation-delay: {index * 0.1}s;">
					<!-- Icon -->
					<div class="w-16 h-16 rounded-2xl bg-gradient-to-r {feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
						<svelte:component this={feature.icon} class="w-8 h-8 text-white" />
					</div>

					<!-- Content -->
					<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
						{feature.title}
					</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed">
						{feature.description}
					</p>

					<!-- Hover Effect -->
					<div class="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<div class="w-full h-1 bg-gradient-to-r {feature.gradient} rounded-full"></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Bottom CTA -->
		<div class="text-center mt-16">
			<div class="glass dark:glass-dark rounded-2xl p-8 max-w-2xl mx-auto">
				<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					Ready to transform your workflow?
				</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-6">
					Join thousands of teams already using organised.today to streamline their communication.
				</p>
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<button class="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
						Start Free Trial
					</button>
					<button class="border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
						Schedule Demo
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
