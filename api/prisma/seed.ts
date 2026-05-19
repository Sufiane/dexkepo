import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

type SourceManhole = {
  manhole_no: string;
  name: string;
  pref_name: string;
  pref_en_name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  pokemon_list: { name: string; zukan_url: string }[];
  picture_url: string;
};

const prisma = new PrismaClient();

async function main() {
  const file = join(__dirname, '..', 'data', 'manholes.json');
  const rows = JSON.parse(readFileSync(file, 'utf8')) as SourceManhole[];

  console.log(`Seeding ${rows.length} manholes...`);

  for (const manhole of rows) {
    await prisma.manhole.upsert({
      where: { manholeNo: manhole.manhole_no },
      update: {
        name: manhole.name,
        prefName: manhole.pref_name,
        prefEnName: manhole.pref_en_name,
        city: manhole.city,
        address: manhole.address,
        lat: manhole.lat,
        lng: manhole.lng,
        pictureUrl: manhole.picture_url,
        pokemon: manhole.pokemon_list as unknown as object,
      },
      create: {
        manholeNo: manhole.manhole_no,
        name: manhole.name,
        prefName: manhole.pref_name,
        prefEnName: manhole.pref_en_name,
        city: manhole.city,
        address: manhole.address,
        lat: manhole.lat,
        lng: manhole.lng,
        pictureUrl: manhole.picture_url,
        pokemon: manhole.pokemon_list as unknown as object,
      },
    });
  }

  console.log('Seed done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
