/**
 * Users service talks to database
 */
import { UserRole } from "@prisma/client";
import prisma from "../../config/prisma";

/**
 * Expected data for createUser(data) and updateUser(data)
 */
type UserInput = {
    email: string;
    passwordHash: string;
    role: UserRole;
}

/**
 * Get all users by email in ascending order
 */
export async function getAllUsers() {
    return prisma.user.findMany({
        // do not include password
        select: {
            id: true,
            email: true,
            role: true
        },
        orderBy: {
            email: "asc",
        },
    });
}

/**
 * Get a user by their id
 */
export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: {id},
        // do not include password
        select: {
            id: true,
            email: true,
            role: true,
            reservations: {
                // avoid over-fetching reservation fields
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                },
            },
        },
    });
}

/**
 * Create a new user
 */
export async function createUser(data: UserInput) {
    return prisma.user.create({
        data,
        // do not include password
        select: {
            id: true,
            email: true,
            role: true,
        },
    });
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, data: Partial<UserInput>) {
    return prisma.user.update({
        where: {id},
        data,
        // do not include password
        select: {
            id: true,
            email: true,
            role: true,
        },
    });
}

/**
 * Delete a user by their id
 */
export async function deleteUser(id: string) {
    return prisma.user.delete({
        where: {id},
        // do not include password
        select: {
            id: true,
            email: true,
            role: true,
        },
    });
}