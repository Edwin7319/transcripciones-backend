import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec, spawn } = require('node:child_process');

@Injectable()
export class CommandService {
  async executeCommand(
    audioName: string,
    fileName: string,
    parameters = '',
    enableSpawn = true,
  ): Promise<{ message: string; output: string }> {
    return new Promise((res, rej) => {
      let commandFromEnvironmentVariable = 'ls ./';
      const mlabsCommand = process.env.MLABS_COMMAND;
      if (mlabsCommand) {
        commandFromEnvironmentVariable = mlabsCommand
          .replace(':audioName', audioName)
          .replace(':fileName', fileName);
      }
      console.log({ commandFromEnvironmentVariable });
      if (enableSpawn) {
        try {
          let output = '';
          const childSpawn = spawn(
            commandFromEnvironmentVariable + parameters,
            [],
            {
              detached: true,
              shell: true,
            },
          );
          childSpawn.stdout.on('data', (data) => {
            output = output + data;
          });
          childSpawn.on('exit', (code) => {
            if (code === 0) {
              res({ message: 'Command executed succesfully', output });
            }
            rej({
              error: `Error code ${code}`,
              message: 'Could not execute commmand',
            });
          });
        } catch (error) {
          rej({
            error: error,
            message: 'Could not execute commmand',
          });
        }
      }
      exec(
        commandFromEnvironmentVariable + parameters,
        (err, output: string) => {
          // once the command has completed, the callback function is called
          if (err) {
            // log and return if we encounter an error
            console.error('could not execute command: ', err);
            rej({ error: err, message: 'Could not execute commmand' });
          }
          // log the output received from the command
          res({ message: 'Command executed succesfully', output: output });
        },
      );
    });
  }
}
