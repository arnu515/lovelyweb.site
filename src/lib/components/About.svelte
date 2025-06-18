<script lang="ts">
	import { Target, Users, Lightbulb, Rocket } from "lucide-svelte";

	const values = [
		{
			icon: Target,
			title: "Mission-Driven",
			description: "We believe communication should be effortless, not overwhelming. Our mission is to eliminate communication chaos."
		},
		{
			icon: Users,
			title: "People-First",
			description: "Technology should work for people, not the other way around. We design with empathy and real user needs in mind."
		},
		{
			icon: Lightbulb,
			title: "Innovation",
			description: "We're constantly pushing the boundaries of what's possible with AI and communication technology."
		},
		{
			icon: Rocket,
			title: "Growth",
			description: "We grow with our users, continuously evolving our platform to meet changing needs and scale."
		}
	];
</script>

<section id="about" class="py-20 bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">
				<span class="text-gradient">About</span>
				lovelyweb.site
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
				We're on a mission to revolutionise how teams communicate and collaborate in the modern workplace.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
			<!-- Story -->
			<div class="space-y-6">
				<h3 class="text-3xl font-bold text-gray-900 dark:text-white">
					Our Story
				</h3>
				<p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
					Founded in 2024, lovelyweb.site was born from a simple observation: teams were drowning in communication tools that didn't talk to each other. Email, chat, video calls, and documents lived in separate silos, creating chaos instead of clarity.
				</p>
				<p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
					We set out to build something different—a unified platform that harnesses the power of AI to not just connect these tools, but to make them intelligent, predictive, and truly helpful.
				</p>
				<p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
					Today, thousands of teams across the globe use lovelyweb.site to streamline their communication, boost productivity, and focus on what matters most: their work and their people.
				</p>
			</div>

			<!-- Visual Element -->
			<div class="relative">
				<div class="glass dark:glass-dark rounded-2xl p-8">
					<div class="space-y-6">
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
								<span class="text-white font-bold">1M+</span>
							</div>
							<div>
								<h4 class="font-semibold text-gray-900 dark:text-white">Messages Organised</h4>
								<p class="text-gray-600 dark:text-gray-300 text-sm">Every single day</p>
							</div>
						</div>
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center">
								<span class="text-white font-bold">10K+</span>
							</div>
							<div>
								<h4 class="font-semibold text-gray-900 dark:text-white">Teams Connected</h4>
								<p class="text-gray-600 dark:text-gray-300 text-sm">Across 50+ countries</p>
							</div>
						</div>
						<div class="flex items-center space-x-4">
							<div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
								<span class="text-white font-bold">99%</span>
							</div>
							<div>
								<h4 class="font-semibold text-gray-900 dark:text-white">Uptime Guarantee</h4>
								<p class="text-gray-600 dark:text-gray-300 text-sm">Always available when you need us</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Values -->
		<div class="mb-16">
			<h3 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
				Our Values
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
				{#each values as value, index}
					<div class="text-center glass dark:glass-dark rounded-2xl p-6 hover:scale-105 transition-transform duration-300 animate-slide-up" style="animation-delay: {index * 0.1}s;">
						<div class="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
							<svelte:component this={value.icon} class="w-8 h-8 text-white" />
						</div>
						<h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
							{value.title}
						</h4>
						<p class="text-gray-600 dark:text-gray-300">
							{value.description}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Team CTA -->
		<div class="text-center glass dark:glass-dark rounded-2xl p-12 max-w-4xl mx-auto">
			<h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
				Join Our Journey
			</h3>
			<p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
				We're always looking for talented individuals who share our vision of making communication effortless and meaningful.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button class="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200">
					View Open Positions
				</button>
				<button class="border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
					Learn More About Us
				</button>
			</div>
		</div>
	</div>
</section>