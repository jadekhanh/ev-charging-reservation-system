/**
 * Auth service talks to database
 */
import { UserRole } from "@prisma/client";
import prisma from "../../config/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Input for registerUser(data)
 */
type RegisterInput = {
    email: string,
    password: string,
    // role input is optional
    role?: UserRole,
}

/**
 * Input for loginUser(data)
 */
type LoginInput = {
    email: string,
    password: string,
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(id: string) {
    return prisma.user.findUnique({
        where: {id},
        // do not include password
        select: {
            id: true,
            email: true,
            role: true
        },
    });
}

/**
 * Create a JWT token
 */
function createToken(userId: string, role: UserRole) {
    // read secret key from .env
    const secret = process.env.JWT_SECRET;

    // stop if the secret key is missing
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    // create a signed JWT token
    return jwt.sign(
        // token payload
        { userId, role},
        // secret key
        secret,
        // token expires in 1 day
        { expiresIn: "1d"}
    );
}

/**
 * Login a user
 */
export async function loginUser(data: LoginInput) {
    // check if this email exists in the database
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    // if email is correct, check if password is correct using bcrypt password-checking function
    const isPasswordCorrect = await bcrypt.compare(
        data.password,
        user.passwordHash,
    );
    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    // create a login pass = JWT token
    const token = createToken(user.id, user.role);
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        },
    };

}

/**
 * Register a user
 */
export async function registerUser(data: RegisterInput) {
    // check if this user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        }
    });
    if (existingUser) {
        throw new Error("User already exists");
    }

    // create a password hash for this user using bcrypt
    const passwordHash = await bcrypt.hash(data.password, 10);

    // create user using information from data
    const user = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: passwordHash,
            // user provided role if exists, else, automatically assign CUSTOMER
            role: data.role ?? UserRole.CUSTOMER,
        },
        select: {
            id: true,
            email: true,
            role: true,
        },
    });

    return user;
}
