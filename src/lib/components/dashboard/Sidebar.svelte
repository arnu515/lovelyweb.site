<script lang="ts">
	import { 
		ChevronDown, 
		Home, 
		Settings, 
		UserPlus, 
		Smartphone, 
		Edit3, 
		Inbox, 
		Send, 
		Archive, 
		AlertTriangle, 
		Trash2, 
		FileText, 
		CheckSquare, 
		Kanban, 
		Calendar, 
		MessageCircle, 
		User,
		Mail
	} from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";

	export let user: any;

	let orgDropdownOpen = false;

	// Mock data for recent contacts
	const recentContacts = [
		{ name: "Sarah Wilson", avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", status: "online" },
		{ name: "Mike Chen", avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", status: "away" },
		{ name: "Emma Davis", avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", status: "online" },
		{ name: "Alex Johnson", avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", status: "offline" },
		{ name: "Lisa Park", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop", status: "online" }
	];

	function toggleOrgDropdown() {
		orgDropdownOpen = !orgDropdownOpen;
	}
</script>

<aside class="w-64 h-screen glass dark:glass-dark border-r border-white/10 dark:border-gray-700/50 flex flex-col">
	<!-- Organization Switcher -->
	<div class="p-4 border-b border-white/10 dark:border-gray-700/50">
		<div class="relative">
			<Button
				variant="ghost"
				class="w-full justify-between p-3 h-auto glass dark:glass-dark hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200"
				on:click={toggleOrgDropdown}
			>
				<div class="flex items-center space-x-3">
					<div class="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
						<Mail class="w-4 h-4 text-white" />
					</div>
					<div class="text-left">
						<div class="font-semibold text-sm text-gray-900 dark:text-white">lovelyweb.site</div>
						<div class="text-xs text-gray-500 dark:text-gray-400">Free Plan</div>
					</div>
				</div>
				<ChevronDown class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 {orgDropdownOpen ? 'rotate-180' : ''}" />
			</Button>

			{#if orgDropdownOpen}
				<div class="absolute top-full left-0 right-0 mt-2 glass dark:glass-dark rounded-xl border border-white/20 dark:border-gray-700/50 shadow-xl z-50 overflow-hidden">
					<!-- Current Organization -->
					<div class="p-3 border-b border-white/10 dark:border-gray-700/50">
						<div class="flex items-center space-x-3 p-2 rounded-lg">
							<div class="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
								<Mail class="w-3 h-3 text-white" />
							</div>
							<div class="flex-1">
								<div class="font-medium text-sm text-gray-900 dark:text-white">lovelyweb.site</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">Free Plan • 1 member</div>
							</div>
							<div class="w-4 h-4 text-purple-500">✓</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="p-2 space-y-1">
						<Button variant="ghost" class="w-full justify-start text-sm h-8 hover:bg-white/20 dark:hover:bg-gray-800/50">
							<Settings class="w-4 h-4 mr-2" />
							Settings
						</Button>
						<Button variant="ghost" class="w-full justify-start text-sm h-8 hover:bg-white/20 dark:hover:bg-gray-800/50">
							<UserPlus class="w-4 h-4 mr-2" />
							Invite members
						</Button>
					</div>

					<div class="border-t border-white/10 dark:border-gray-700/50 p-2 space-y-1">
						<Button variant="ghost" class="w-full justify-start text-sm h-8 hover:bg-white/20 dark:hover:bg-gray-800/50">
							<Smartphone class="w-4 h-4 mr-2" />
							Get mobile app
						</Button>
						<div class="px-3 py-1">
							<div class="text-xs text-gray-500 dark:text-gray-400">+ New workspace</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<div class="flex-1 overflow-y-auto p-4 space-y-6">
		<!-- Home -->
		<div>
			<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
				<Home class="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
				<span class="font-medium text-gray-900 dark:text-white">Home</span>
			</Button>
		</div>

		<!-- Email Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Edit3 class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Compose</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Inbox class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Inbox</span>
					<span class="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">12</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Send class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Sent Items</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Archive class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Archived</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<AlertTriangle class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Spam</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Trash2 class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Trash</span>
				</Button>
			</div>
		</div>

		<!-- Planning Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Planning</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<FileText class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Notes</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<CheckSquare class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Tasks</span>
					<span class="ml-auto text-xs bg-blue-500 text-white px-2 py-1 rounded-full">3</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Kanban class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Kanban</span>
				</Button>
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<Calendar class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Calendar</span>
				</Button>
			</div>
		</div>

		<!-- Chat Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chat</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="w-full justify-start p-3 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
					<MessageCircle class="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
					<span class="text-sm text-gray-900 dark:text-white">Direct Messages</span>
					<span class="ml-auto text-xs bg-green-500 text-white px-2 py-1 rounded-full">2</span>
				</Button>
				
				<!-- Recent Contacts -->
				<div class="space-y-1 pt-2">
					{#each recentContacts as contact}
						<Button variant="ghost" class="w-full justify-start p-2 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200">
							<div class="relative mr-3">
								<img src={contact.avatar} alt={contact.name} class="w-6 h-6 rounded-full" />
								<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 {contact.status === 'online' ? 'bg-green-400' : contact.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'}"></div>
							</div>
							<span class="text-sm text-gray-900 dark:text-white truncate">{contact.name}</span>
						</Button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</aside>