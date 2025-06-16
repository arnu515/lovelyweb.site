<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { ArrowRight, Mail, MessageCircle, Video, Brain } from "lucide-svelte";
</script>

<section class="relative min-h-screen flex items-center justify-center overflow-hidden py-[30%] sm:py-[20%] md:py-[10%]">
	<!-- Background Gradient -->
	<div class="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
	
	<!-- Animated Background Elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;"></div>
	</div>

	<div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<div class="max-w-4xl mx-auto">
			<!-- Badge -->
			<div class="md:inline-flex items-center space-x-2 glass dark:glass-dark rounded-full px-4 py-2 mb-8 animate-fade-in hidden">
				<Brain class="w-4 h-4 text-purple-600" />
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					AI-Powered Communication Platform
				</span>
			</div>

			<!-- Main Headline -->
			<h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
				<span class="text-gradient">Organise</span> your entire
				<br />
				communication workflow
			</h1>

			<!-- Subheadline -->
			<p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed animate-slide-up" style="animation-delay: 0.2s;">
				Unify email, chat, and meetings with AI-powered organisation. 
				<br class="hidden md:block" />
				Never miss important communications again.
			</p>

			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style="animation-delay: 0.4s;">
				<Button size="lg" class="gradient-primary text-white px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-200 animate-glow">
					Start Free Trial
					<ArrowRight class="ml-2 w-5 h-5" />
				</Button>
				<Button size="lg" variant="outline" class="px-8 py-4 text-lg font-semibold glass dark:glass-dark border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20">
					Watch Demo
				</Button>
			</div>

			<!-- Feature Icons -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-slide-up" style="animation-delay: 0.6s;">
				<div class="flex flex-col items-center space-y-2">
					<div class="w-16 h-16 rounded-2xl glass dark:glass-dark flex items-center justify-center">
						<Mail class="w-8 h-8 text-purple-600" />
					</div>
					<h3 class="font-semibold text-gray-900 dark:text-white">Smart Email</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400 text-center">AI-powered email management and organisation</p>
				</div>
				<div class="flex flex-col items-center space-y-2">
					<div class="w-16 h-16 rounded-2xl glass dark:glass-dark flex items-center justify-center">
						<MessageCircle class="w-8 h-8 text-blue-600" />
					</div>
					<h3 class="font-semibold text-gray-900 dark:text-white">Team Chat</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400 text-center">Real-time messaging with intelligent features</p>
				</div>
				<div class="flex flex-col items-center space-y-2">
					<div class="w-16 h-16 rounded-2xl glass dark:glass-dark flex items-center justify-center">
						<Video class="w-8 h-8 text-indigo-600" />
					</div>
					<h3 class="font-semibold text-gray-900 dark:text-white">Video Meetings</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400 text-center">Seamless video conferencing with AI notes</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
		<div class="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
			<div class="w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
		</div>
	</div>
</section>
