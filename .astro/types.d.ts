declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"forge": {
"01-letter-from-the-baron.md": {
	id: "01-letter-from-the-baron.md";
  slug: "01-letter-from-the-baron";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"02-path-to-stone-tooth.md": {
	id: "02-path-to-stone-tooth.md";
  slug: "02-path-to-stone-tooth";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"03-gates-of-stone-tooth.md": {
	id: "03-gates-of-stone-tooth.md";
  slug: "03-gates-of-stone-tooth";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"04-ulfe-and-the-she-orcs.md": {
	id: "04-ulfe-and-the-she-orcs.md";
  slug: "04-ulfe-and-the-she-orcs";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"05-into-the-glitterhame.md": {
	id: "05-into-the-glitterhame.md";
  slug: "05-into-the-glitterhame";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"06-duergar-affair.md": {
	id: "06-duergar-affair.md";
  slug: "06-duergar-affair";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"07-dreggard-the-durable.md": {
	id: "07-dreggard-the-durable.md";
  slug: "07-dreggard-the-durable";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"08-friend-of-the-forest.md": {
	id: "08-friend-of-the-forest.md";
  slug: "08-friend-of-the-forest";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"09-dreggard-vs-grendar.md": {
	id: "09-dreggard-vs-grendar.md";
  slug: "09-dreggard-vs-grendar";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"10-ghost-from-syrus-past.md": {
	id: "10-ghost-from-syrus-past.md";
  slug: "10-ghost-from-syrus-past";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"11-mighty-nightscale.md": {
	id: "11-mighty-nightscale.md";
  slug: "11-mighty-nightscale";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"12-leering-dog.md": {
	id: "12-leering-dog.md";
  slug: "12-leering-dog";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"13-underdark-initiates.md": {
	id: "13-underdark-initiates.md";
  slug: "13-underdark-initiates";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"14-fledgling-drow.md": {
	id: "14-fledgling-drow.md";
  slug: "14-fledgling-drow";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"15-mystery-of-von-zim.md": {
	id: "15-mystery-of-von-zim.md";
  slug: "15-mystery-of-von-zim";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"16-vampires-zombies-webs.md": {
	id: "16-vampires-zombies-webs.md";
  slug: "16-vampires-zombies-webs";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"17-zeeriths-ingredients.md": {
	id: "17-zeeriths-ingredients.md";
  slug: "17-zeeriths-ingredients";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"18-scutters-the-unshakeable.md": {
	id: "18-scutters-the-unshakeable.md";
  slug: "18-scutters-the-unshakeable";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"19-betrayal-worth-a-mine-of-godsdream.md": {
	id: "19-betrayal-worth-a-mine-of-godsdream.md";
  slug: "19-betrayal-worth-a-mine-of-godsdream";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"20-poison-pool-crossing.md": {
	id: "20-poison-pool-crossing.md";
  slug: "20-poison-pool-crossing";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"21-sanzac-the-slithery.md": {
	id: "21-sanzac-the-slithery.md";
  slug: "21-sanzac-the-slithery";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"22-welcome-to-zethlentyn.md": {
	id: "22-welcome-to-zethlentyn.md";
  slug: "22-welcome-to-zethlentyn";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"23-stroll-through-mushroom-forest.md": {
	id: "23-stroll-through-mushroom-forest.md";
  slug: "23-stroll-through-mushroom-forest";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"24-infiltrating-celestilite-fort.md": {
	id: "24-infiltrating-celestilite-fort.md";
  slug: "24-infiltrating-celestilite-fort";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"25-archie-lends-helping-wing.md": {
	id: "25-archie-lends-helping-wing.md";
  slug: "25-archie-lends-helping-wing";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"26-jeramy-the-judas.md": {
	id: "26-jeramy-the-judas.md";
  slug: "26-jeramy-the-judas";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"27-spit-baths-and-thorn-whips.md": {
	id: "27-spit-baths-and-thorn-whips.md";
  slug: "27-spit-baths-and-thorn-whips";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"28-role-play-challenge.md": {
	id: "28-role-play-challenge.md";
  slug: "28-role-play-challenge";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
"29-fearsome-boneclaw.md": {
	id: "29-fearsome-boneclaw.md";
  slug: "29-fearsome-boneclaw";
  body: string;
  collection: "forge";
  data: any
} & { render(): Render[".md"] };
};
"strahd": {
"01-fancy-dinner.md": {
	id: "01-fancy-dinner.md";
  slug: "01-fancy-dinner";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"02-abandoned-manor.md": {
	id: "02-abandoned-manor.md";
  slug: "02-abandoned-manor";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"03-mouth-full-of-guiding-bolt.md": {
	id: "03-mouth-full-of-guiding-bolt.md";
  slug: "03-mouth-full-of-guiding-bolt";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"04-way-out-of-death-house.md": {
	id: "04-way-out-of-death-house.md";
  slug: "04-way-out-of-death-house";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"05-dance-with-the-vistani.md": {
	id: "05-dance-with-the-vistani.md";
  slug: "05-dance-with-the-vistani";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"06-arms-of-morgantha.md": {
	id: "06-arms-of-morgantha.md";
  slug: "06-arms-of-morgantha";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"07-assult-by-bats-and-zombies.md": {
	id: "07-assult-by-bats-and-zombies.md";
  slug: "07-assult-by-bats-and-zombies";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"08-vallakian-politics.md": {
	id: "08-vallakian-politics.md";
  slug: "08-vallakian-politics";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"09-leaving-vallaki.md": {
	id: "09-leaving-vallaki.md";
  slug: "09-leaving-vallaki";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"10-tomb-of-kavan.md": {
	id: "10-tomb-of-kavan.md";
  slug: "10-tomb-of-kavan";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"11-odins-errand-and-waizard-of-wines.md": {
	id: "11-odins-errand-and-waizard-of-wines.md";
  slug: "11-odins-errand-and-waizard-of-wines";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
"12-scorching-skeletons.md": {
	id: "12-scorching-skeletons.md";
  slug: "12-scorching-skeletons";
  body: string;
  collection: "strahd";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = never;
}
