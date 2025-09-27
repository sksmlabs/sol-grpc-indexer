import Fastify from 'fastify';

const fastify = Fastify({
    logger: true
})

// ROUTE
fastify.get('/', async function handler(request, reply) {
    return {hello: 'world'}
});

// RUN THE SERVER
try {
    await fastify.listen({port: 3000});
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}