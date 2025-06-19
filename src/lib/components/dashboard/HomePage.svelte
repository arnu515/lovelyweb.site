<script lang="ts">
	import { Search, Clock, Mail, MessageCircle, FileText, Calendar, CheckSquare, Kanban, User } from "lucide-svelte";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";

	export let user: any;

	// Mock data for recently viewed places
	const recentlyViewed = [
		{ name: "Project Planning", type: "kanban", icon: Kanban, lastViewed: "2 hours ago", gradient: "from-blue-500 to-cyan-500" },
		{ name: "Meeting Notes", type: "notes", icon: FileText, lastViewed: "Yesterday", gradient: "from-green-500 to-teal-500" },
		{ name: "Weekly Tasks", type: "tasks", icon: CheckSquare, lastViewed: "2 days ago", gradient: "from-purple-500 to-pink-500" },
		{ name: "Team Calendar", type: "calendar", icon: Calendar, lastViewed: "3 days ago", gradient: "from-orange-500 to-red-500" },
		{ name: "Client Emails", type: "email", icon: Mail, lastViewed: "1 week ago", gradient: "from-indigo-500 to-purple-500" }
	];

	// Mock data for recent emails
	const recentEmails = [
		{ from: "Sarah Wilson", subject: "Q4 Budget Review", preview: "Hi team, I've attached the Q4 budget review for your consideration...", time: "2 min ago", unread: true },
		{ from: "Mike Chen", subject: "Project Update", preview: "The development phase is progressing well. We're on track to meet...", time: "1 hour ago", unread: true },
		{ from: "Emma Davis", subject: "Meeting Reschedule", preview: "I need to reschedule our meeting tomorrow due to a conflict...", time: "3 hours ago", unread: false },
		{ from: "Alex Johnson", subject: "Design Feedback", preview: "I've reviewed the latest designs and have some feedback to share...", time: "Yesterday", unread: false },
		{ from: "Lisa Park", subject: "Welcome to the team!", preview: "Welcome aboard! We're excited to have you join our team...", time: "2 days ago", unread: false }
	];

	// Mock data for recent chats
	const recentChats = [
		{ name: "Sarah Wilson", message: "Thanks for the update!", time: "5 min ago", avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", unread: 2 },
		{ name: "Design Team", message: "Mike: The mockups look great", time: "1 hour ago", avatar: "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", unread: 0 },
		{ name: "Emma Davis", message: "Let's sync up tomorrow", time: "2 hours ago", avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", unread: 0 },
		{ name: "Project Alpha", message: "Alex: Deployment successful", time: "Yesterday", avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", unread: 1 },
		{ name: "Lisa Park", message: "Welcome to the team! 🎉", time: "2 days ago", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", unread: 0 }
	];

	let searchQuery = "";
</script>

	<div class="max-w-6xl mx-auto p-8 space-y-8">
		<!-- Header -->
		<div class="text-center space-y-4">
			<div class="flex items-center justify-center space-x-3 mb-4">
				<div class="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
					<span class="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
				</div>
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
					Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name || 'User'}!
				</h1>
			</div>
		</div>

		<!-- Search Bar -->
		<div class="max-w-2xl mx-auto">
			<div class="relative">
				<Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
				<Input
					bind:value={searchQuery}
					placeholder="Ask or find anything from your workspace..."
					class="w-full pl-12 pr-4 py-4 text-lg glass dark:glass-dark border-white/20 dark:border-gray-700/50 rounded-2xl shadow-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
				/>
			</div>
		</div>

		<!-- Recently Viewed -->
		<div class="space-y-4">
			<div class="flex items-center space-x-2">
				<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recently viewed</h2>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
				{#each recentlyViewed as item}
					<Button variant="ghost" class="h-auto p-0 hover:scale-105 transition-all duration-200">
						<div class="glass dark:glass-dark rounded-xl p-6 w-full text-left hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-r {item.gradient} flex items-center justify-center mb-4">
								<svelte:component this={item.icon} class="w-6 h-6 text-white" />
							</div>
							<h3 class="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">{item.lastViewed}</p>
						</div>
					</Button>
				{/each}
			</div>
		</div>

		<!-- Recent Activity Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Recent Emails -->
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<Mail class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Latest emails</h2>
				</div>
				<div class="glass dark:glass-dark rounded-2xl p-6 space-y-4">
					{#each recentEmails as email}
						<div class="flex items-start space-x-4 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200 cursor-pointer">
							<div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
								<span class="text-white font-semibold text-sm">{email.from.charAt(0)}</span>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between mb-1">
									<h4 class="font-semibold text-gray-900 dark:text-white text-sm truncate">{email.from}</h4>
									<span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{email.time}</span>
								</div>
								<h5 class="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1 truncate {email.unread ? 'font-bold' : ''}">{email.subject}</h5>
								<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{email.preview}</p>
							</div>
							{#if email.unread}
								<div class="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent Chats -->
			<div class="space-y-4">
				<div class="flex items-center space-x-2">
					<MessageCircle class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent chats</h2>
				</div>
				<div class="glass dark:glass-dark rounded-2xl p-6 space-y-4">
					{#each recentChats as chat}
						<div class="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200 cursor-pointer">
							<div class="relative">
								<img src={chat.avatar} alt={chat.name} class="w-10 h-10 rounded-full" />
								{#if chat.unread > 0}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
										{chat.unread}
									</div>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between mb-1">
									<h4 class="font-semibold text-gray-900 dark:text-white text-sm truncate">{chat.name}</h4>
									<span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{chat.time}</span>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400 truncate {chat.unread > 0 ? 'font-medium' : ''}">{chat.message}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
