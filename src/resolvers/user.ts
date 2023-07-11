import { PrismaClient, User } from "@prisma/client";
import { gql } from "apollo-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface SignupInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UpdateUserInput {
  username: string;
  email: string;
  password: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

const typeDefs = gql`
  type User {
    id: Int!
    username: String!
    email: String!
    movies: [Movie!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    username: String
    email: String
    password: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    signup(data: SignupInput!): AuthPayload!
    login(data: LoginInput!): AuthPayload!
    updateUser(id: ID!, data: UpdateUserInput!): User!
    changePassword(id: ID!, data: ChangePasswordInput!): User!
    deleteUser(id: ID!): User!
  }
`;

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

const generateToken = (user: User): string => {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

const userResolvers = {
  Query: {
    users: () => {
      return prisma.user.findMany();
    },
    user: (_: any, { id }: { id: number }) => {
      return prisma.user.findUnique({
        where: { id },
        include: { movies: true }, // Include the user's movies in the response
      });
    },
  },
  Mutation: {
    signup: async (_: any, { data }: { data: SignupInput }) => {
      const { username, email, password } = data;

      // Check if the user with the same email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      // Generate authentication token
      const token = generateToken(newUser);

      return {
        token,
        user: newUser,
      };
    },
    login: async (_: any, { data }: { data: LoginInput }) => {
      const { email, password } = data;

      // Check if the user with the email exists
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Compare the password with the stored hash
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate authentication token
      const token = generateToken(user);

      return {
        token,
        user,
      };
    },
    updateUser: async (
      _: any,
      { id, data }: { id: number; data: UpdateUserInput }
    ) => {
      return prisma.user.update({
        where: { id },
        data,
      });
    },
    changePassword: async (
      _: any,
      { id, data }: { id: number; data: ChangePasswordInput }
    ) => {
      const { currentPassword, newPassword } = data;

      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new Error("User not found");
      }

      // Compare the current password with the stored hash
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        throw new Error("Invalid password");
      }

      // Hash the password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      return prisma.user.update({
        where: { id },
        data: {
          password: hashedNewPassword,
        },
      });
    },
    deleteUser: async (_: any, { id }: { id: number }) => {
      return prisma.user.delete({
        where: { id },
      });
    },
  },
  User: {
    movies: (parent: User) => {
      return prisma.user
        .findUnique({
          where: { id: parent.id },
        })
        .movies();
    },
  },
};

export { typeDefs, userResolvers };
