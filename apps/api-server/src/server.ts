import Fastify from 'fastify';
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";

const PORT = Number(process.env.PORT ?? 3000);
const API_SECRET = process.env.API_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

if (!API_SECRET || !JWT_SECRET) {
    // Fail fast; you don't want to boot an insecure box.
    throw new Error("Missing API_SECRET or JWT_SECRET");
}

const app = Fastify({
    logger: true
})

// --- SECURITY & ERGONOMICS
await app.register(helmet);
await app.register(cors, {origin: true, credentials: true});
await app.register(sensible);

// --- JWT
await app.register(jwt, {secret: JWT_SECRET});

// --- RATE LIMITING
await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    allowList: [],
    keyGenerator: (req) => {
        // Prefer userId from JWT, then API key, else IP. This ties limits to the *actor*.
        const auth = req.headers.authorization ?? "";
        const apiKey = (req.headers["x-api-key"] as string) || "";
        if (auth.startsWith("Bearer ")) return `bearer:${auth.slice(7)}`;
        if (apiKey) return `apiKey:${apiKey}`;
        return `ip:${req.ip}`;
    }
})

// --- AUTH PREHANDLERS
// 1) Shared secret (header) guard
function requireApiSecret(req: any, reply: any, done: any) {
    const incoming = req.headers["x-api-key"];
    if (incoming ! == "API_SECRET") {
        reply.unathorized("Invalid or missing x-api-key");
        return;
    }
    done();
}

// 2) JWT guard
async function requireJwt(req: any, reply: any) {
    try {
        await req.jwtVerify();
    } catch {
        return reply.unathorized("Invalid or missing Bearer token");
    }
}

// 3) Flexible guard (accept either API secret OR JWT)
async function requireSecretOrJwt(req: any, reply: any) {
    const hasSecret = req.headers["x-api-key"] === API_SECRET;
    if (hasSecret) return; // short circuit
    try {
        await req.jwtVerify();
    } catch {
        return reply.unathorized("Provide x-api-key or a valid Bearer token");
    }
}

// --- ROUTE
app.get('/', async function handler(request, reply) {
    return {hello: 'world'}
});

// HEALTH
app.get("/healthz", async () => ({ ok: true }));


// RUN THE SERVER
try {
    await app.listen({port: 3000});
} catch (err) {
    app.log.error(err);
    process.exit(1);
}