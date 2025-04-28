ALTER TABLE `pokemons` RENAME COLUMN "is_unlocked" TO "is_caught";--> statement-breakpoint
ALTER TABLE `pokemons` ADD `locations` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pokemons` ADD `caught_location` text;--> statement-breakpoint
ALTER TABLE `pokemons` ADD `caught_date` text;--> statement-breakpoint
ALTER TABLE `pokemons` ADD `caught_image` text;