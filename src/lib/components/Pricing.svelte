<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Check, Star, Zap, Building } from "lucide-svelte";

	const plans = [
		{
			name: "Starter",
			price: "Free",
			period: "",
			description: "Perfect for individuals and small teams getting started",
			icon: Star,
			features: [
				"Up to 5 team members",
				"1,000 emails per month",
				"Basic AI email organisation",
				"Standard chat features",
				"5 video meetings per month",
				"1GB storage",
				"Community support"
			],
			cta: "Get Started Free",
			popular: false,
			gradient: "from-gray-500 to-gray-600"
		},
		{
			name: "Professional",
			price: "£29",
			period: "/month",
			description: "For growing teams that need advanced AI features",
			icon: Zap,
			features: [
				"Up to 25 team members",
				"Unlimited emails",
				"Advanced AI email management",
				"Smart chat with AI translation",
				"Unlimited video meetings",
				"50GB storage",
				"AI-powered meeting transcription",
				"Priority support",
				"Custom integrations"
			],
			cta: "Start Free Trial",
			popular: true,
			gradient: "from-purple-500 to-blue-500"
		},
		{
			name: "Enterprise",
			price: "Custom",
			period: "",
			description: "For large organisations with custom requirements",
			icon: Building,
			features: [
				"Unlimited team members",
				"Unlimited everything",
				"Custom AI model training",
				"Advanced security & compliance",
				"Dedicated account manager",
				"Custom integrations",
				"On-premise deployment option",
				"24/7 premium support",
				"Custom SLA"
			],
			cta: "Contact Sales",
			popular: false,
			gradient: "from-indigo-500 to-purple-500"
		}
	];
</script>

<section id="pricing" class="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-16">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">
				<span class="text-gradient">Simple, Transparent</span>
				<br />
				Pricing
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
				Choose the perfect plan for your team. Start free and scale as you grow.
			</p>
		</div>

		<!-- Pricing Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			{#each plans as plan, index}
				<div class="relative group">
					<!-- Popular Badge -->
					{#if plan.popular}
						<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
							<div class="gradient-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
								Most Popular
							</div>
						</div>
					{/if}

					<!-- Card -->
					<div class="glass dark:glass-dark rounded-2xl p-8 h-full {plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''} hover:scale-105 transition-all duration-300 animate-slide-up" style="animation-delay: {index * 0.1}s;">
						<!-- Icon -->
						<div class="w-16 h-16 rounded-2xl bg-gradient-to-r {plan.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
							<svelte:component this={plan.icon} class="w-8 h-8 text-white" />
						</div>

						<!-- Plan Info -->
						<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							{plan.name}
						</h3>
						<p class="text-gray-600 dark:text-gray-300 mb-6">
							{plan.description}
						</p>

						<!-- Price -->
						<div class="mb-8">
							<div class="flex items-baseline">
								<span class="text-4xl font-bold text-gray-900 dark:text-white">
									{plan.price}
								</span>
								{#if plan.period}
									<span class="text-gray-600 dark:text-gray-300 ml-1">
										{plan.period}
									</span>
								{/if}
							</div>
						</div>

						<!-- Features -->
						<ul class="space-y-4 mb-8">
							{#each plan.features as feature}
								<li class="flex items-start space-x-3">
									<Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
									<span class="text-gray-600 dark:text-gray-300">
										{feature}
									</span>
								</li>
							{/each}
						</ul>

						<!-- CTA Button -->
						<Button 
							class={`w-full ${plan.popular ? 'gradient-primary text-white hover:scale-105' : 'border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'} transition-all duration-200`}
							size="lg"
						>
							{plan.cta}
						</Button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Bottom Note -->
		<div class="text-center mt-12">
			<p class="text-gray-600 dark:text-gray-300">
				All plans include a 14-day free trial. No credit card required.
			</p>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
				Need a custom solution? <a href="#contact" class="text-purple-600 dark:text-purple-400 hover:underline">Contact our sales team</a>
			</p>
		</div>
	</div>
</section>