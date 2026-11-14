/**
 * Mounts Zag.js machines (the state machines behind Ark UI) onto server-rendered
 * markup, and keeps them alive across Astro's client-side navigation.
 *
 * The server renders each component with its Ark anatomy already in place
 * (`data-scope`, `data-part`, `data-state`, ids), so the page is styled before
 * any script runs. The machine then takes the markup over and keeps its
 * attributes in sync.
 *
 * Lifecycle: bundled scripts run once, and a client-side navigation swaps the
 * DOM without re-running them. So components register a mount function here,
 * every page load mounts it on the fresh markup, and every swap stops the
 * machines bound to the markup that is about to leave.
 */
import { normalizeProps, spreadProps, type VanillaMachine } from "@zag-js/vanilla";

type Cleanup = () => void;
type Attrs = Record<string, unknown>;

const mounted = new Set<Cleanup>();

document.addEventListener("astro:before-swap", () => {
	for (const cleanup of mounted) cleanup();
	mounted.clear();
});

/** Calls `mount` for every element matching `selector` on each page load. */
export function onEachPage(selector: string, mount: (element: HTMLElement) => Cleanup): void {
	document.addEventListener("astro:page-load", () => {
		for (const element of document.querySelectorAll<HTMLElement>(selector)) {
			mounted.add(mount(element));
		}
	});
}

/**
 * Starts `machine` and re-spreads the props that `bind` returns onto their
 * elements after every state change. `bind` receives the connected API and
 * returns `[element, props]` pairs; a missing element is skipped.
 */
export function run<Api>(
	// biome-ignore lint/suspicious/noExplicitAny: each Zag machine has its own schema type
	machine: VanillaMachine<any>,
	// biome-ignore lint/suspicious/noExplicitAny: `connect` signatures differ per machine
	connect: (service: any, normalize: typeof normalizeProps) => Api,
	bind: (api: Api) => Array<[Element | null, Attrs]>,
): Cleanup {
	let cleanups: Cleanup[] = [];
	const render = () => {
		cleanups = bind(connect(machine.service, normalizeProps)).flatMap(([element, props]) =>
			element ? [spreadProps(element, props)] : [],
		);
	};

	machine.start();
	render();
	const unsubscribe = machine.subscribe(render);

	return () => {
		unsubscribe();
		for (const cleanup of cleanups) cleanup();
		machine.stop();
	};
}
