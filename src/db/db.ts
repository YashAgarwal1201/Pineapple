import Dexie, { type EntityTable } from 'dexie';

import { Polygon, Rectangle } from '../Services/interfaces';

export interface PineappleSession {
  id: number;
  imageBlob: Blob | null;
  imageMeta: {
    title: string;
    type: string;
  };
  polygons: Polygon[];
  rectangles: Rectangle[];
}

const db = new Dexie('PineappleDB') as Dexie & {
  sessions: EntityTable<
    PineappleSession,
    'id'
  >;
};

db.version(1).stores({
  sessions: 'id'
});

export { db };
