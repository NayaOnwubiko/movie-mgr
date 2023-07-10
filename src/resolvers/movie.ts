import { PrismaClient } from "@prisma/client";
import { gql } from "apollo-server";

const prisma = new PrismaClient();

// Input types for creating and updating a movie
interface CreateMovieInput {
  movieName: string;
  description: string;
  director: string;
  releaseDate: Date;
  userId: number;
}

interface UpdateMovieInput {
  id: number;
  movieName?: string;
  description?: string;
  director?: string;
  releaseDate?: Date;
}

interface MovieQueryFilters {
  search?: string;
}

interface MovieQueryOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  skip?: number;
}

const typeDefs = gql`
  scalar Date

  type Movie {
    id: ID!
    movieName: String!
    description: String!
    director: String!
    releaseDate: Date!
    user: User!
  }

  input CreateMovieInput {
    movieName: String!
    description: String!
    director: String!
    releaseDate: Date!
    userId: Int!
  }

  input UpdateMovieInput {
    id: ID!
    movieName: String
    description: String
    director: String
    releaseDate: Date
  }

  input MovieQueryFilters {
    search: String
  }

  input MovieQueryOptions {
    sortBy: String
    sortOrder: String
    limit: Int
    skip: Int
  }

  type Query {
    movies(filters: MovieQueryFilters, options: MovieQueryOptions): [Movie!]!
    movie(id: ID!): Movie
  }

  type Mutation {
    createMovie(data: CreateMovieInput!): Movie!
    updateMovie(data: UpdateMovieInput!): Movie!
    deleteMovie(id: ID!): Movie
  }
`;

const movieResolvers = {
  Query: {
    movies: async (
      _: any,
      {
        filters,
        options,
      }: { filters: MovieQueryFilters; options: MovieQueryOptions }
    ) => {
      const { search } = filters || {};
      const { sortBy, sortOrder, limit, skip } = options;

      // Query options based on the provided filters and options
      const queryOptions: any = {};

      if (search) {
        queryOptions.where = {
          OR: [
            { movieName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      if (sortBy) {
        queryOptions.orderBy = { [sortBy]: sortOrder || "asc" };
      }

      if (limit) {
        queryOptions.take = limit;
      }

      if (skip) {
        queryOptions.skip = skip;
      }

      // Fetch the movies based on the query options
      const movies = await prisma.movie.findMany(queryOptions);
      return movies;
    },
    movie: (_: any, { id }: { id: number }) => {
      // Fetch a specific movie by its ID
      const movie = prisma.movie.findUnique({ where: { id } });
      return movie;
    },
  },
  Mutation: {
    createMovie: async (
      _: any,
      { data }: { data: CreateMovieInput },
      context: { userId: number }
    ) => {
      // Check if the user is authenticated
      if (!context.userId) {
        throw new Error("You are not authenticated");
      }

      // Create a new movie
      const movie = await prisma.movie.create({ data });
      return movie;
    },
    updateMovie: async (
      _: any,
      { data }: { data: UpdateMovieInput },
      context: { userId: number }
    ) => {
      // Check if the user is authenticated
      if (!context.userId) {
        throw new Error("You are not authenticated");
      }

      const { id, ...movieData } = data;

      // Update the specified movie
      const updatedMovie = await prisma.movie.update({
        where: { id },
        data: movieData,
      });
      return updatedMovie;
    },
    deleteMovie: async (
      _: any,
      { id }: { id: number },
      context: { userId: number }
    ) => {
      // Check if the user is authenticated
      if (!context.userId) {
        throw new Error("You are not authenticated");
      }

      // Delete the specified movie
      const deletedMovie = await prisma.movie.delete({ where: { id } });
      return deletedMovie;
    },
  },
  Movie: {
    user: (parent: any) => {
      return prisma.movie
        .findUnique({
          where: { id: parent.id },
        })
        .user();
    },
  },
};

export { typeDefs, movieResolvers };
