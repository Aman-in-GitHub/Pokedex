CREATE TABLE `pokemons` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(256) NOT NULL,
	`description` text NOT NULL,
	`generation` text NOT NULL,
	`cry` text NOT NULL,
	`legacy_cry` text,
	`image` text NOT NULL,
	`shiny` text NOT NULL,
	`extra_images` text,
	`evolutions` text NOT NULL,
	`types` text NOT NULL,
	`height` integer NOT NULL,
	`weight` integer NOT NULL,
	`stats` text NOT NULL,
	`color` text NOT NULL,
	`is_unlocked` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`is_male` integer NOT NULL
);
