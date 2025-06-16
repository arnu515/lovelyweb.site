import Root from "./button.svelte";
import type { Button as ButtonPrimitive } from "bits-ui";
import type { ComponentProps } from "svelte";

type Size = "default" | "sm" | "lg" | "icon";
type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

type Props = ComponentProps<ButtonPrimitive.Root> & {
	variant?: Variant;
	size?: Size;
};

export {
	Root,
	type Props,
	//
	Root as Button,
	type Props as ButtonProps,
};