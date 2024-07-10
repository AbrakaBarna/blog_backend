import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Albums
  const album1 = await prisma.album.create({
    data: {
      title: 'Mountain Adventure',
      start_date: new Date('2019-10-26'),
      end_date: new Date('2019-12-03'),
      pictures: {
        create: [
          { url: 'https://picsum.photos/id/444' },
          { url: 'https://picsum.photos/id/359' },
          { url: 'https://picsum.photos/id/357' },
          { url: 'https://picsum.photos/id/772' },
        ],
      },
    },
  })

  const album2 = await prisma.album.create({
    data: {
      title: 'Urban Exploration',
      start_date: new Date('2020-11-01'),
      end_date: new Date('2020-12-07'),
      pictures: {
        create: [
          { url: 'https://picsum.photos/id/360' },
          { url: 'https://picsum.photos/id/250' },
          { url: 'https://picsum.photos/id/458' },
          { url: 'https://picsum.photos/id/12' },
        ],
      },
    },
  })

  // Seed Countries
  const country1 = await prisma.country.create({
    data: {
      id: '840', // USA
    },
  })

  const country2 = await prisma.country.create({
    data: {
      id: '392', // Japan
    },
  })

  // Seed BlogPosts
  await prisma.blogPost.create({
    data: {
      title: 'Exploring the Grand Canyon',
      content:
        'The Grand Canyon, a colossal chasm carved by the Colorado River...',
      publication_date: new Date('2016-05-18'),
      start_date: new Date('2019-09-30'),
      end_date: new Date('2019-11-21'),
      albums: {
        connect: { id: album1.id },
      },
      countries: {
        connect: { id: country1.id },
      },
    },
  })

  await prisma.blogPost.create({
    data: {
      title: 'A Journey Through Tokyo',
      content:
        'In the heart of Japan, Tokyo stands as a beacon of modernity fused with age-old traditions...',
      publication_date: new Date('2021-06-15'),
      start_date: new Date('2016-08-30'),
      end_date: new Date('2016-11-01'),
      albums: {
        connect: [{ id: album1.id }, { id: album2.id }],
      },
      countries: {
        connect: { id: country2.id },
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
