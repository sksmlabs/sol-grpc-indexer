import { PrismaClient } from '@prisma/client';


class Database {
    public client: PrismaClient

    constructor() {
        this.client = new PrismaClient();
    }

    async disconnect() {
        await this.client.$disconnect();
    }
}

export const db = new Database();