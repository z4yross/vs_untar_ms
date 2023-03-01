import debugLib from 'debug';
const debug = debugLib('app:dataAccess:amqp');
const error = debugLib('app:dataAccess:amqp:error');

// const amqp = require('amqplib');

import amqp from 'amqplib';

const amqpHost = process.env.AMQP_URL;

const delay = (ms) => new Promise((resolve => setTimeout(resolve, ms)));

export const connectRabbitMq = async () => {
    try {
        debug('Connecting to RabbitMQ');
        const conn = await amqp.connect(amqpHost)
        conn.on('error', function (err) {
            if (err.message !== 'Connection closing') {
                error('[AMQP] conn error', err.message);
            }
        });

        conn.on('close', function () {
            error('[AMQP] reconnecting');
            return connectRabbitMq();
        });

        const channel = await conn.createChannel();
        debug('Channel created');

        return channel;
    } catch (err) {
        error(err);
        debug('[AMQP] reconnecting in 1s');
        await delay(1000);
        return connectRabbitMq();
    }
};
