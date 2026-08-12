export const studioAccents = {
  "japanese-maple": {
    name: "Japanese Maple",
    description: "Deep maple red",
    colour: "#7a2f2f",
    mark: "maple",
  },

  jacaranda: {
    name: "Jacaranda",
    description: "Soft violet",
    colour: "#746287",
    mark: "jacaranda",
  },

  "judas-tree": {
    name: "Judas Tree",
    description: "Dusky rose",
    colour: "#8a5669",
    mark: "judas",
  },

  juniper: {
    name: "Juniper",
    description: "Deep evergreen",
    colour: "#365447",
    mark: "juniper",
  },

  olive: {
    name: "Olive",
    description: "Quiet olive green",
    colour: "#69705a",
    mark: "olive",
  },

  wisteria: {
    name: "Wisteria",
    description: "Soft lavender",
    colour: "#81758f",
    mark: "wisteria",
  },

  pine: {
    name: "Pine",
    description: "Forest green",
    colour: "#30493c",
    mark: "pine",
  },

  azalea: {
    name: "Azalea",
    description: "Warm rose",
    colour: "#985f69",
    mark: "azalea",
  },

  ginkgo: {
    name: "Ginkgo",
    description: "Muted gold",
    colour: "#a28749",
    mark: "ginkgo",
  },

  elm: {
    name: "Elm",
    description: "Warm earth",
    colour: "#725846",
    mark: "elm",
  },
} as const;

export type StudioAccent =
  keyof typeof studioAccents;

export const studioAccentOptions =
  Object.entries(studioAccents).map(
    ([value, accent]) => ({
      value: value as StudioAccent,
      ...accent,
    }),
  );

const legacyAccents: Record<
  string,
  StudioAccent
> = {
  stone: "elm",
  green: "juniper",
  amber: "ginkgo",
  rose: "azalea",
  blue: "jacaranda",
  violet: "wisteria",
};

export function normaliseStudioAccent(
  value: string | null | undefined,
): StudioAccent {
  if (
    value &&
    value in studioAccents
  ) {
    return value as StudioAccent;
  }

  if (
    value &&
    legacyAccents[value]
  ) {
    return legacyAccents[value];
  }

  return "japanese-maple";
}

export function resolveStudioAccent(
  value: string | null | undefined,
) {
  return studioAccents[
    normaliseStudioAccent(value)
  ];
}