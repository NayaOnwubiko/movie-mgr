import { PrismaClient } from "@prisma/client";
import { SignupInput, LoginInput } from "../schema/user.graphql";
import { generateToken } from "utilis/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const userResolvers = {
  Query: {
    //user queries go here
  },

  Mutation: {
    //Sign user up and generate token
    signup: async (_: any, { data }: { data: SignupInput }) => {
      const { username, email, password } = data;
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password,
        },
      });

      const token = generateToken(user.id);
      return {
        token,
        user,
      };
    },

    //Login
    login: async (_: any, { data }: { data: LoginInput }) => {
      const { email, password } = data;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error("Invalid login credentials");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid login credentials");
      }

      const token = generateToken(user.id);

      return {
        token,
        user,
      };
    },

    //Change Password
    changePassword: async (
      _: any,
      {
        oldPassword,
        newPassword,
      }: { oldPassword: string; newPassword: string },
      { userId }: { userId: number | null }
    ) => {
      if (!userId) {
        throw new Error("Authentication required");
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid password");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return updatedUser;
    },
  },
};

export default userResolvers;
