export type Studio = {
  slug: string;
  name: string;
  owner: string;
  symbol: string;
  subtitle: string;
  about: string;
  sections: string[];
};

export const studios: Studio[] = [
  {
    slug: "nebari",
    name: "Studio Nebari",
    owner: "Kevin",
    symbol: "🍁",
    subtitle:
      "Roots first. Growth second.",
    about:
      "The idea workshop behind Nebari — a place for experiments, observations, projects and things still finding their shape.",
    sections: [
      "Projects",
      "Experiments",
      "Ideas",
    ],
  },
  {
    slug: "heather",
    name: "Heather's Studio",
    owner: "Heather",
    symbol: "🎨",
    subtitle:
      "A quiet place for colour, ideas and things worth making.",
    about:
      "Heather's own corner of the internet — a place for paintings, drawings, works in progress and whatever else finds its way onto the page.",
    sections: [
      "Paintings",
      "Drawings",
      "Works in Progress",
    ],
  },
  {
    slug: "sharm",
    name: "Sharm's Sketchbook",
    owner: "Sharm",
    symbol: "✏️",
    subtitle:
      "Drawings, ideas and creative experiments.",
    about:
      "Sharm's own creative space — somewhere to keep sketches, finished pieces and the ideas that are still finding their shape.",
    sections: [
      "Sketchbook",
      "Finished Pieces",
      "Ideas",
    ],
  },
];

export function getStudio(slug: string) {
  return studios.find(
    (studio) => studio.slug === slug,
  );
}