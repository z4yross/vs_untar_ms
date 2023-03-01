import { spawn } from 'child_process';


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
    
            ls.on('exit', (code) => {
                resolve(`child process exited with code ${code}`);
            });
        });

        const res = await promise;
        console.log(res);
    }
    catch (err) {
        console.log(err);
    }
}

await test();

// set amqp listener 

