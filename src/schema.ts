import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  arg,
  asNexusMethod,
  enumType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

// New Data Types
const Album = objectType({
  name: 'Album',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('title')
    t.nonNull.field('start_date', { type: 'DateTime' })
    t.nonNull.field('end_date', { type: 'DateTime' })
    t.nonNull.list.nonNull.field('pictures', {
      type: 'Picture',
      resolve: async (parent, _, context: Context) => {
        try {
          const album = await context.prisma.album.findUnique({
            where: { id: parent.id },
            include: { pictures: true },
          })
          return album?.pictures || []
        } catch (error) {
          // Handle or log the error appropriately
          console.error('Failed to fetch pictures:', error)
          return []
        }
      },
    })
  },
})

const Picture = objectType({
  name: 'Picture',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('url')
    t.nonNull.string('albumId')
  },
})

const BlogPost = objectType({
  name: 'BlogPost',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('title')
    t.nonNull.string('content')
    t.nonNull.field('publication_date', { type: 'DateTime' })
    t.nonNull.field('start_date', { type: 'DateTime' })
    t.nonNull.field('end_date', { type: 'DateTime' })
    t.nonNull.list.nonNull.field('albums', {
      type: 'Album',
      resolve: async (parent, _, context: Context) => {
        try {
          const blogPost = await context.prisma.blogPost.findUnique({
            where: { id: parent.id },
            include: { albums: true },
          })

          return blogPost?.albums || []
        } catch (error) {
          console.error('Failed to fetch albums:', error)
          return []
        }
      },
    })
    t.nonNull.list.nonNull.field('countries', {
      type: 'Country',
      resolve: async (parent, _, context: Context) => {
        try {
          const blogPost = await context.prisma.blogPost.findUnique({
            where: { id: parent.id },
            include: { countries: true },
          })

          return blogPost?.countries || []
        } catch (error) {
          console.error('Failed to fetch countries:', error)
          return []
        }
      },
    })
  },
})

const Country = objectType({
  name: 'Country',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.list.nonNull.field('blogPosts', {
      type: 'BlogPost',
      resolve: async (parent, _, context: Context) => {
        try {
          const country = await context.prisma.country.findUnique({
            where: { id: parent.id },
            include: { blogPosts: true },
          })

          return country?.blogPosts || []
        } catch (error) {
          console.error('Failed to fetch blog posts:', error)
          return []
        }
      },
    })
  },
})

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    // Album Queries
    t.nonNull.list.nonNull.field('allAlbums', {
      type: 'Album',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.album.findMany({
          include: { pictures: true },
        })
      },
    })

    t.nullable.field('albumById', {
      type: 'Album',
      args: { id: nonNull(stringArg()) },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.album.findUnique({
          where: { id: args.id.toString() },
          include: { pictures: true },
        })
      },
    })

    // BlogPost Queries
    t.nonNull.list.nonNull.field('allBlogPosts', {
      type: 'BlogPost',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.blogPost.findMany({
          include: { countries: true, albums: true },
        })
      },
    })

    t.nullable.field('blogPostById', {
      type: 'BlogPost',
      args: { id: nonNull(stringArg()) },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.blogPost.findUnique({
          where: { id: args.id.toString() },
          include: { countries: true, albums: true },
        })
      },
    })

    t.nonNull.list.nonNull.field('blogPostsPublishedAfter', {
      type: 'BlogPost',
      args: { date: nonNull(stringArg()) },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.blogPost.findMany({
          where: {
            publication_date: {
              gt: new Date(args.date),
            },
          },
          include: { countries: true, albums: true },
        })
      },
    })
  },
})

// const Mutation = objectType({
//   name: 'Mutation',
//   definition(t) {
//     // Album Mutations
//     t.nonNull.field('createAlbum', {
//       type: 'Album',
//       args: {
//         data: nonNull(
//           arg({
//             type: 'AlbumCreateInput',
//           }),
//         ),
//       },
//       resolve: (_, { data }, context: Context) => {
//         return context.prisma.album.create({
//           data: {
//             title: data.title,
//             start_date: data.start_date,
//             end_date: data.end_date,
//             pictures: {
//               create: data.pictures.map((url: String) => ({ url })),
//             },
//           },
//         })
//       },
//     })

//     t.field('updateAlbum', {
//       type: 'Album',
//       args: {
//         id: nonNull(intArg()),
//         data: nonNull(
//           arg({
//             type: 'AlbumUpdateInput',
//           }),
//         ),
//       },
//       resolve: async (_, { id, data }, context: Context) => {
//         const album = await context.prisma.album.update({
//           where: { id },
//           data: {
//             title: data.title || undefined,
//             start_date: data.start_date || undefined,
//             end_date: data.end_date || undefined,
//             pictures: data.pictures
//               ? {
//                   deleteMany: {},
//                   create: data.pictures.map((url: String) => ({ url })),
//                 }
//               : undefined,
//           },
//         })
//         return album
//       },
//     })

//     t.field('deleteAlbum', {
//       type: 'Album',
//       args: {
//         id: nonNull(intArg()),
//       },
//       resolve: (_, { id }, context: Context) => {
//         return context.prisma.album.delete({
//           where: { id },
//         })
//       },
//     })

// BlogPost Mutations
//   t.nonNull.field('createBlogPost', {
//     type: 'BlogPost',
//     args: {
//       data: nonNull(
//         arg({
//           type: 'BlogPostCreateInput',
//         }),
//       ),
//     },
//     resolve: (_, { data }, context: Context) => {
//       return context.prisma.blogPost.create({
//         data: {
//           title: data.title,
//           content: data.content,
//           publication_date: data.publication_date,
//           start_date: data.start_date,
//           end_date: data.end_date,
//           albums: {
//             connect: data.albumIds.map((id: String) => ({ id })),
//           },
//           countries: {
//             connect: data.countryIds.map((id: String) => ({ id })),
//           },
//         },
//       })
//     },
//   })

//   t.field('updateBlogPost', {
//     type: 'BlogPost',
//     args: {
//       id: nonNull(intArg()),
//       data: nonNull(
//         arg({
//           type: 'BlogPostUpdateInput',
//         }),
//       ),
//     },
//     resolve: async (_, { id, data }, context: Context) => {
//       const blogPost = await context.prisma.blogPost.update({
//         where: { id },
//         data: {
//           title: data.title || undefined,
//           content: data.content || undefined,
//           publication_date: data.publication_date || undefined,
//           start_date: data.start_date || undefined,
//           end_date: data.end_date || undefined,
//           albums: data.albumIds
//             ? {
//                 set: data.albumIds.map((id: String) => ({ id })),
//               }
//             : undefined,
//           countries: data.countryIds
//             ? {
//                 set: data.countryIds.map((id: String) => ({ id })),
//               }
//             : undefined,
//         },
//       })
//       return blogPost
//     },
//   })

//   t.field('deleteBlogPost', {
//     type: 'BlogPost',
//     args: {
//       id: nonNull(intArg()),
//     },
//     resolve: (_, { id }, context: Context) => {
//       return context.prisma.blogPost.delete({
//         where: { id },
//       })
//     },
//   })
//   },
// })

export const schema = makeSchema({
  types: [
    Query,
    // Mutation,
    Album,
    Picture,
    BlogPost,
    Country,
    SortOrder,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
