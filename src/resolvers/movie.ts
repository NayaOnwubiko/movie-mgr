import { PrismaClient } from "@prisma/client";
import { CreateMovieInput, UpdateMovieInput } from "../schema/movie.graphql";

const prisma = new PrismaClient();
const DEFAULT_PAGE_SIZE = 10;

const movieResolvers = {
  Query: {
    //Get all movies
    movies: async (
      _: any,
      {
        sortBy,
        filter,
        skip,
        take,
      }: { sortBy?: string; filter?: string; skip?: number; take?: number }
    ) => {
      const movies = await prisma.movie.findMany({
        orderBy: { [sortBy || "id"]: "asc" },
        where: {
          OR: [
            { movieName: { contains: filter || "", mode: "insensitive" } },
            { description: { contains: filter || "", mode: "insensitive" } },
          ],
        },
        skip: skip || 0,
        take: take || DEFAULT_PAGE_SIZE,
      });

      return movies;
    },

    //Get a single movie
    movie: async (_: any, { id }: { id: string }) => {
      const movie = await prisma.movie.findUnique({
        where: { id: Number(id) },
      });

      return movie;
    },
  },

  Mutation: {
    //Create a new movie
    createMovie: async (
      _: any,
      { data }: { data: CreateMovieInput },
      { userId }: { userId: number | null }
    ) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      const { releaseDate, ...movieData } = data;

      const newMovie = await prisma.movie.create({
        data: {
          ...movieData,
          releaseDate: new Date(releaseDate).toISOString(), //Convert to ISO String format
          userId: Number(userId),
        },
      });

      return newMovie;
    },

    //Update a movie
    updateMovie: async (
      _: any,
      { id, data }: { id: string; data: UpdateMovieInput },
      { userId }: { userId: number }
    ) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      const existingMovie = await prisma.movie.findUnique({
        where: { id: Number(id) },
      });
      if (!existingMovie) {
        throw new Error("Movie not found");
      }

      if (existingMovie.userId !== userId) {
        throw new Error("You are not authorized to update this movie");
      }

      const updatedMovie = await prisma.movie.update({
        where: { id: Number(id) },
        data,
      });

      return updatedMovie;
    },

    //Delete a movie
    deleteMovie: async (
      _: any,
      { id }: { id: string },
      { userId }: { userId: number }
    ) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      const movie = await prisma.movie.findUnique({
        where: { id: Number(id) },
      });

      if (!movie) {
        throw new Error("Movie not found");
      }

      if (movie.userId !== userId) {
        throw new Error("You are not authorized to delete this movie");
      }

      const deletedMovie = await prisma.movie.delete({
        where: { id: Number(id) },
      });

      return deletedMovie;
    },
  },
};

export default movieResolvers;
