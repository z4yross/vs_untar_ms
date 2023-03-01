import debugLib from 'debug';
const debug = debugLib('app:controller:amqp');
const error = debugLib('app:controller:error:amqp');

import { spawn } from 'child_process';


const queued = [];
const running = [];

const MAX_PROCESSES = process.env.MAX_PROCESSES || 2;

// move pwd to the root of the project, then to the data folder
// then unzip the file and untar it
const test = async () => {
    try {
        const ls = spawn('ls');

        const promise = new Promise((resolve, reject) => {
            ls.stdout.on('data', (data) => {
                resolve(`stdout: ${data}`);
            });
    
            ls.stderr.on('data', (data) => {
                reject(`stderr: ${data}`);
            });
    
            ls.on('close', (code) => {
                resolve(`child process exited with code ${code}`);
            });
        });

        const res = await promise;
        debug(res);
    }
    catch (err) {
        error(err);
    }
}

await test();

// spawn child process to untar the project, then notify the user over the mq
const untar = async (project_id, provided_by) => {
    try {
        const tar = spawn('tar', [
            '-xvf', 
            `/data/${provided_by}/${project_id}/data/fastq_pass.tar.gz`,
        ]);

        const promise = new Promise((resolve, reject) => {
            tar.stdout.on('data', (data) => {
                debug(`stdout: ${data}`);
            });
    
            tar.stderr.on('data', (data) => {
                reject(`stderr: ${data}`);
            });
    
            tar.on('close', (code) => {
                resolve(`child process exited with code ${code}`);
            });
        });
    } catch (err) {
        error(err);
    }
}


// add a process to the queue
export const addProcess = ({project_id, provided_by}) => {
    const obj = {
        project_id,
        provided_by,
        cmd: async (pid, pvd) => {
            try {
                await untar(pid, pvd);
                running = running.filter((p) => p.project_id !== project_id && p.provided_by !== provided_by);
                updateQueue();
            } catch (err) {
                debug(err);
            }
        }
    }
    
    // check if process is already queed or running, process obj
    // {project_id, provided_by, cmd: process}
    const isQueued = queued.find((p) => p.project_id === project_id && p.provided_by === provided_by);
    const isRunning = running.find((p) => p.project_id === project_id && p.provided_by === provided_by);

    if (!isQueued && !isRunning)
        queued.push(obj);
}

// add or remove processes from queue based on the number of processes running
const updateQueue = () => {
    if (running.length < MAX_PROCESSES) {
        const next = queued.shift();
        if (next) {
            running.push(next);
            next();
        }
    }
}