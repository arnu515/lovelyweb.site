<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Button as ButtonPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "./index.js";

	type $$Props = ComponentProps<ButtonPrimitive.Root> & {
		variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
		size?: "default" | "sm" | "lg" | "icon";
	};

	export let variant: $$Props["variant"] = "default";
	export let size: $$Props["size"] = "default";
	export let builders: $$Props["builders"] = [];

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size }), className)}
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>