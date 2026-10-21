import data from "./companions-data.json";

export type Companion = {
  nameAge: string;
  job: string;
  lead: string;
  role: string;
  gradient: string;
  letter: string;
  bio: string;
  traits: string[];
  speech: string;
  dialogue: { who: string; text: string }[];
  likes: string[];
  moods: string[];
  withHim: string[];
};

export const COMPANIONS: Record<string, Companion> = data as Record<string, Companion>;

export const COMPANION_IDS = Object.keys(COMPANIONS);

export function getCompanion(id: string): Companion | undefined {
  return COMPANIONS[id];
}
