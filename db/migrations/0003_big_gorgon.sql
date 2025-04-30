PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pokemons` (
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
	`locations` text NOT NULL,
	`color` text NOT NULL,
	`is_shiny` integer DEFAULT false NOT NULL,
	`is_caught` integer DEFAULT false NOT NULL,
	`caught_date` text NOT NULL,
	`caught_images` text NOT NULL,
	`caught_location` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pokemons`("id", "name", "description", "generation", "cry", "legacy_cry", "image", "shiny", "extra_images", "evolutions", "types", "height", "weight", "stats", "locations", "color", "is_shiny", "is_caught", "caught_date", "caught_images", "caught_location") SELECT "id", "name", "description", "generation", "cry", "legacy_cry", "image", "shiny", "extra_images", "evolutions", "types", "height", "weight", "stats", "locations", "color", "is_shiny", "is_caught", "caught_date", "caught_images", "caught_location" FROM `pokemons`;--> statement-breakpoint
DROP TABLE `pokemons`;--> statement-breakpoint
ALTER TABLE `__new_pokemons` RENAME TO `pokemons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;