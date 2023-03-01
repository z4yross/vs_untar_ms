import debug from 'debug';
const debug = debugLib('app:controller:amqp');
const error = debugLib('app:controller:error:amqp');

import { connectRabbitMq } from '../dataAccess/amqp.js';

const AMQP = await connectRabbitMq();

// set amqp listener on queue "untar"
// on message cmd untar with corresponding project_id and provided_by

const listenToUntar = async () => {
    try {
        debug('Listening to untar queue');

        const queue = 'untar';

        await AMQP.assertQueue(queue, { durable: true });

        AMQP.consume(queue, async (msg) => {
            const { cmd, data } = JSON.parse(msg.content.toString());
            const { project_id, provided_by } = data;
            
            debug(`Received message: ${cmd} data: ${JSON.stringify(data)}`);

            // untar
            // await untar({ project_id, provided_by });

            // delete message from queue
            AMQP.ack(msg);
        });
    } catch (err) {
        error(err);
    }
}