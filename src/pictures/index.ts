import type { Language } from '../settings/settings';
import type { Picture, PictureCollection } from './types';
import { TILES_FLUENT } from './tilesFluent';

export type { Picture, PictureCollection } from './types';

const COLLECTIONS: Record<string, PictureCollection> = {
  [TILES_FLUENT.id]: TILES_FLUENT,
};

export function getCollection(id: string): PictureCollection | undefined {
  return COLLECTIONS[id];
}

export function pictureUrl(collection: PictureCollection, picture: Picture): string {
  return `${import.meta.env.BASE_URL}${collection.basePath}/${picture.id}.${collection.extension ?? 'svg'}`;
}

export function pictureName(picture: Picture, language: Language): string {
  return picture.name[language];
}
