import { prisma } from "../../lib/prisma";

export class UserRepository {
    findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    findWithPassword(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                passwordHash: true,
            }
        })
    }

    updateProfile(userId: string, data: {name: string}) {
        return prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    async changePasswordAndRevokeSessions(userId: string, passwordHash: string) {
        await prisma.$transaction(async (tx) =>{
            await tx.user.update({
                where: { id: userId },
                data: { passwordHash }
            });

            await tx.session.deleteMany({
                where: { userId }
            })
        })
    }

    deleteAccount(userId: string) {
        return prisma.user.delete({
            where: { id: userId }
        })
    }
}