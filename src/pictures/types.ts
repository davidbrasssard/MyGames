import type { Language } from '../settings/settings';

export interface Picture {
  id: string;
  name: Record<Language, string>;
}

// Every image belongs to a collection (CONCEPT.md, "Pictures"). Games ask a collection for N pictures
// and do not care where they come from.
export interface PictureCollection {
  id: string;
  basePath: string; // folder under the site root that holds <picture id>.svg
  pictures: Picture[];
}
