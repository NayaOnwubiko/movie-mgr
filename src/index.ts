import express from "express";
import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import { typeDefs as movieTypeDefs, movieResolvers } from "./resolvers/movie";
import { typeDefs as userTypeDefs, userResolvers } from "./resolvers/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

const prisma = new PrismaClient();

const app = express();

const server = new ApolloServer({
  typeDefs: [movieTypeDefs, userTypeDefs],
  resolvers: [movieResolvers, userResolvers],
  context: ({ req }) => {
    // Extract the user ID from the Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = getUserIdFromToken(token);
    return { prisma, userId };
  },
});

async function startApolloServer() {
  await server.start(); // Start the Apollo Server
  server.applyMiddleware({ app });
}

startApolloServer().then(() => {
  app.listen({ port: 4000 }, () =>
    console.log(`Server running at http://localhost:4000${server.graphqlPath}`)
  );
});

function getUserIdFromToken(token: string | undefined): number | null {
  if (token) {
    try {
      // Verify and decode the JWT token
      const decoded: any = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      throw new Error("Invalid token");
    }
  }
  return null;
}
