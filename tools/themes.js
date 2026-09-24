'use strict';

/** Kid-friendly pop-culture theme packs (PG only). */
const THEMES = [
  {
    id: 'harry-potter',
    name: 'Harry Potter',
    characters: ['Hermione', 'Harry', 'Ron', 'Neville', 'Luna', 'Ginny', 'Fred', 'George', 'McGonagall', 'Hagrid', 'Dumbledore', 'Hedwig'],
    settings: ['Hogwarts', 'the Great Hall', 'Diagon Alley', 'the Room of Requirement', 'Platform 9¾', 'Hogsmeade', 'the Quidditch pitch', 'the library'],
    items: ['Charms essays', 'Nimbus brooms', 'Chocolate Frogs', 'Bertie Bott beans', 'spellbooks', 'cauldron scoops', 'house points', 'golden snitches'],
    verbs: ['stacks', 'sorts', 'counts', 'practices with', 'delivers', 'organizes', 'labels', 'shares']
  },
  {
    id: 'star-wars',
    name: 'Star Wars',
    characters: ['Luke', 'Leia', 'Rey', 'Finn', 'BB-8', 'R2-D2', 'C-3PO', 'Yoda', 'Obi-Wan', 'Ahsoka', 'Poe', 'Grogu'],
    settings: ['Tatooine', 'the Millennium Falcon', 'Dagobah', 'a Rebel base', 'the Death Star trench', 'Naboo', 'Jakku', 'a Jedi temple'],
    items: ['lightsaber forms', 'astromech bolts', 'hyperdrive parts', 'ration packs', 'X-wing fuel cells', 'training remotes', 'holocrons', 'power converters'],
    verbs: ['calibrates', 'repairs', 'counts', 'trains with', 'loads', 'maps', 'reroutes', 'inventories']
  },
  {
    id: 'pixar',
    name: 'Pixar / Disney',
    characters: ['Lightning McQueen', 'Mater', 'Woody', 'Buzz', 'Remy', 'Wall-E', 'Joy', 'Mike Wazowski', 'Sulley', 'Dory', 'Nemo', 'Miguel'],
    settings: ['Radiator Springs', 'Andy\'s room', 'Gusteau\'s kitchen', 'Monsters, Inc.', 'the reef', 'Pixar Pier', 'a race track', 'the Land of the Dead'],
    items: ['tire stacks', 'toy boxes', 'recipe cards', 'scream canisters', 'seashells', 'memory orbs', 'race laps', 'guitars'],
    verbs: ['laps', 'sorts', 'counts', 'stacks', 'delivers', 'labels', 'shares', 'measures']
  },
  {
    id: 'nintendo',
    name: 'Nintendo / Pokémon',
    characters: ['Mario', 'Luigi', 'Peach', 'Toad', 'Link', 'Zelda', 'Pikachu', 'Ash', 'Samus', 'Kirby', 'Yoshi', 'Donkey Kong'],
    settings: ['the Mushroom Kingdom', 'Hyrule', 'a Pokémon Center', 'Rainbow Road', 'a warp pipe', 'Kanto Route 1', 'a dungeon', 'Yoshi\'s Island'],
    items: ['coins', 'Power Stars', 'Poké Balls', 'heart pieces', 'bananas', 'mushrooms', 'rupees', 'mystery boxes'],
    verbs: ['collects', 'counts', 'shares', 'stacks', 'trades', 'sorts', 'jumps over', 'inventories']
  },
  {
    id: 'marvel',
    name: 'Marvel (kid-friendly)',
    characters: ['Spider-Man', 'Miles Morales', 'Iron Man', 'Black Panther', 'Shuri', 'Captain America', 'Ms. Marvel', 'Ant-Man', 'the Guardians', 'Doctor Strange', 'Wong', 'Groot'],
    settings: ['Queens', 'Wakanda', 'Avengers Tower', 'the Sanctum', 'a Quinjet', 'Knowhere', 'a science lab', 'the Helicarrier'],
    items: ['web cartridges', 'vibranium samples', 'nanotech parts', 'training drones', 'shield drills', 'portal rings', 'gadget kits', 'mission briefings'],
    verbs: ['calibrates', 'counts', 'tests', 'shares', 'stacks', 'maps', 'repairs', 'inventories']
  },
  {
    id: 'lotr',
    name: 'Lord of the Rings (light)',
    characters: ['Frodo', 'Sam', 'Merry', 'Pippin', 'Gandalf', 'Aragorn', 'Legolas', 'Gimli', 'Bilbo', 'Arwen', 'Éowyn', 'Faramir'],
    settings: ['the Shire', 'Rivendell', 'Lothlórien', 'Minas Tirith', 'a hobbit hole', 'the Prancing Pony', 'Helm\'s Deep', 'Bag End'],
    items: ['lembas portions', 'walking sticks', 'map scrolls', 'pipeweed pouches', 'elven cloaks', 'rations', 'trail markers', 'riddle books'],
    verbs: ['packs', 'counts', 'shares', 'maps', 'sorts', 'labels', 'measures', 'inventories']
  },
  {
    id: 'atla',
    name: 'Avatar: The Last Airbender',
    characters: ['Aang', 'Katara', 'Sokka', 'Toph', 'Zuko', 'Suki', 'Iroh', 'Appa', 'Momo', 'Azula', 'Mai', 'Ty Lee'],
    settings: ['the Southern Water Tribe', 'Ba Sing Se', 'the Fire Nation capital', 'an air temple', 'Omashu', 'the Jasmine Dragon', 'a sky bison saddle', 'a bending gym'],
    items: ['scrolls', 'tea cups', 'boomerangs', 'earth discs', 'fire flakes', 'water skins', 'wanted posters', 'training weights'],
    verbs: ['practices with', 'counts', 'shares', 'stacks', 'brews', 'labels', 'maps', 'inventories']
  },
  {
    id: 'cartoons',
    name: 'Classic cartoons',
    characters: ['Scooby-Doo', 'Shaggy', 'Velma', 'Daphne', 'Bugs Bunny', 'Daffy Duck', 'Tom', 'Jerry', 'SpongeBob', 'Patrick', 'Phineas', 'Ferb'],
    settings: ['the Mystery Machine', 'Bikini Bottom', 'a backyard workshop', 'Acme Labs', 'a haunted amusement park (PG)', 'Jellyfish Fields', 'a cartoon kitchen', 'Camp Half-joke'],
    items: ['Scooby Snacks', 'krabby patties', 'blueprints', 'gadget parts', 'jellyfish nets', 'to-do lists', 'sandwich stacks', 'invention kits'],
    verbs: ['counts', 'shares', 'builds', 'sorts', 'labels', 'stacks', 'inventories', 'measures']
  },
  {
    id: 'disney-classics',
    name: 'Disney classics',
    characters: ['Moana', 'Maui', 'Elsa', 'Anna', 'Aladdin', 'Genie', 'Mulan', 'Mushu', 'Simba', 'Timon', 'Pumbaa', 'Belle'],
    settings: ['the ocean canoe', 'Arendelle', 'Agrabah', 'the Beast\'s library', 'Pride Rock', 'a training courtyard', 'a festival square', 'a royal kitchen'],
    items: ['coconuts', 'ice crystals', 'magic lamps (countable props)', 'scrolls', 'bananas', 'festival lanterns', 'recipe cards', 'training spears'],
    verbs: ['counts', 'shares', 'stacks', 'labels', 'maps', 'practices with', 'delivers', 'inventories']
  },
  {
    id: 'lego',
    name: 'LEGO / builders',
    characters: ['Emmet', 'Wyldstyle', 'Benny', 'Unikitty', 'MetalBeard', 'a Master Builder', 'a minifigure crew', 'a robot buddy'],
    settings: ['Brickburg', 'a spaceship build table', 'a castle set', 'a city street layout', 'a sorting tray', 'a building contest', 'a instruction booklet desk', 'a bin of bricks'],
    items: ['studs', 'plates', 'bricks', 'instruction steps', 'sorted color piles', 'baseplates', 'minifigure accessories', 'build modules'],
    verbs: ['sorts', 'counts', 'stacks', 'labels', 'shares', 'inventories', 'measures', 'organizes']
  },
  {
    id: 'sports-kids',
    name: 'Kid sports adventure',
    characters: ['a junior Jedi athlete', 'a Quidditch junior', 'a Radiator Springs racer', 'a Pokémon league trainee', 'a Wakandan youth athlete', 'a bending gym student', 'a Mushroom Cup racer', 'a Mystery Inc. PE club'],
    settings: ['a practice field', 'a training track', 'a gymnasium', 'a obstacle course', 'a scoreboard booth', 'a locker room (PG)', 'a team huddle', 'a time-trial lane'],
    items: ['practice cones', 'scorecards', 'water bottles', 'lap counters', 'team jerseys', 'drill stations', 'whistles', 'medal tallies'],
    verbs: ['counts', 'times', 'shares', 'stacks', 'labels', 'measures', 'records', 'inventories']
  },
  {
    id: 'space-kids',
    name: 'Friendly space adventures',
    characters: ['a young padawan', 'BB-8\'s friend', 'Wall-E\'s helper', 'a Starfleet junior (fun)', 'a rocket raccoon buddy', 'a moon-base intern', 'a comet cartographer', 'a satellite tech kid'],
    settings: ['a moon base', 'an asteroid workshop', 'a friendly space station', 'a comet trail map room', 'a rocket hangar', 'an observatory', 'a zero-g practice bay', 'a planetarium'],
    items: ['fuel cells', 'star charts', 'tool kits', 'sample jars', 'antenna parts', 'mission logs', 'oxygen packs (counted)', 'orbit markers'],
    verbs: ['calibrates', 'counts', 'maps', 'labels', 'shares', 'inventories', 'measures', 'stacks']
  }
];

function pick(arr, i) {
  return arr[Math.abs(i) % arr.length];
}

function flavorOf(theme, salt) {
  const s = salt | 0;
  return {
    theme,
    themeId: theme.id,
    themeName: theme.name,
    char: pick(theme.characters, s),
    char2: pick(theme.characters, s + 3),
    setting: pick(theme.settings, s + 7),
    item: pick(theme.items, s + 11),
    item2: pick(theme.items, s + 13),
    verb: pick(theme.verbs, s + 17)
  };
}

module.exports = { THEMES, flavorOf, pick };
