import { prisma } from "../../lib/prisma";

export class AuthRepository{
    findUserByEmail(email: string){
        return prisma.user.findUnique({
            where: { email },
        });
    }

    findUserById(id: string){
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    createUser(data: {name: string, email: string, passwordHash: string}){
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
    }

    createSession(data: {userId: string, tokenHash: string, expiresAt: Date, ipAddress?: string, userAgent?: string;}){
        return prisma.session.create({
            data,
        })
    }

    findSessionByTokenHash(tokenHash: string){
        return prisma.session.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
            },
        });
    }

    deleteSession(id: string){
        return prisma.session.deleteMany({
            where: { id },
        });
    }
}