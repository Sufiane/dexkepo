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

  for (const m of rows) {
    await prisma.manhole.upsert({
      where: { manholeNo: m.manhole_no },
      update: {
        name: m.name,
        prefName: m.pref_name,
        prefEnName: m.pref_en_name,
        city: m.city,
        address: m.address,
        lat: m.lat,
        lng: m.lng,
        pictureUrl: m.picture_url,
        pokemon: m.pokemon_list as unknown as object,
      },
      create: {
        manholeNo: m.manhole_no,
        name: m.name,
        prefName: m.pref_name,
        prefEnName: m.pref_en_name,
        city: m.city,
        address: m.address,
        lat: m.lat,
        lng: m.lng,
        pictureUrl: m.picture_url,
        pokemon: m.pokemon_list as unknown as object,
      },
    });
  }

  console.log('Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
