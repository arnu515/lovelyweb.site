<script lang="ts">
	import { ChevronDown, Home, Settings, UserPlus, Smartphone, FileEdit as Edit3, Inbox, Send, Archive, AlertTriangle, Trash2, FileText, CheckSquare, Kanban, Calendar, MessageCircle, Mail } from "lucide-svelte";
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
	<div class="p-2 border-b border-gray-200/50 dark:border-gray-700/50">
		<div class="relative">
			<Button
				variant="ghost"
				class="w-full shadow-sm justify-between p-2 border-gray-200 dark:border-gray-800/50 border h-auto glass dark:glass-dark hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200"
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
				<div class="absolute top-full left-0 right-0 mt-2 glass dark:glass-dark rounded-xl border-gray-200 dark:border-gray-800/50 border shadow-xl z-50 overflow-hidden">
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
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<div class="flex-1 overflow-y-auto p-2 space-y-6">
		<!-- Home -->
		<div>
			<Button variant="ghost" class="sb-btn">
				<Home class="w-5 h-5" />
				<span class="font-medium">Home</span>
			</Button>
		</div>

		<!-- Email Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="sb-btn">
					<Edit3 class="icon" />
					<span>Compose</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Inbox class="icon" />
					<span>Inbox</span>
					<span class="badge">12</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Send class="icon" />
					<span>Sent Items</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Archive class="icon" />
					<span>Archived</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<AlertTriangle class="icon" />
					<span>Spam</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Trash2 class="icon" />
					<span>Trash</span>
				</Button>
			</div>
		</div>

		<!-- Planning Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Planning</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="sb-btn">
					<FileText class="icon" />
					<span>Notes</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<CheckSquare class="icon" />
					<span>Tasks</span>
					<span class="badge">3</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Kanban class="icon" />
					<span>Kanban</span>
				</Button>
				<Button variant="ghost" class="sb-btn">
					<Calendar class="icon" />
					<span>Calendar</span>
				</Button>
			</div>
		</div>

		<!-- Chat Section -->
		<div class="space-y-2">
			<div class="px-3 py-1">
				<h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chat</h3>
			</div>
			<div class="space-y-1">
				<Button variant="ghost" class="sb-btn">
					<MessageCircle class="icon" />
					<span>Direct Messages</span>
					<span class="badge">2</span>
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

<style lang="postcss">
	:global(.sb-btn) {
		@apply w-full justify-start p-1 h-auto hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 items-center gap-2;
	}
	:global(.sb-btn .icon) {
	  @apply w-4 h-4 text-gray-600 dark:text-gray-400;
	}
	:global(.sb-btn .badge) {
	  @apply ml-auto text-xs bg-purple-500 text-white rounded-full;
	  padding: 2px 4px;
	}
	:global(.sb-btn span) {
	  @apply text-gray-900 dark:text-white;
	}
</style>
