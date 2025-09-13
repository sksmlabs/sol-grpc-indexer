import { PrismaClient } from '@prisma/client';


class Database {
    public client: PrismaClient

    constructor() {
        this.client = new PrismaClient();
    }
}

export const db = new Database();