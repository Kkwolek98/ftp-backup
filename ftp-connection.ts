import archiver from 'archiver';
import { AccessOptions, Client } from 'basic-ftp';
import * as fs from 'fs';

export class FtpConnection {

    private client: Client;

    public async init(options: AccessOptions): Promise<any> {

        this.client = new Client();
        // this.client.ftp.verbose = true; 
        try {
            await this.client.access(options);
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    public async getDir(dirPath: string): Promise<string> {

        try {
            await this.client.downloadToDir('./' + dirPath, dirPath);
            return './' + dirPath;
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    public async getZippedDir(dirPath: string): Promise<any> {

        try {
            await this.getDir(dirPath).then((dir) => {
                const output = fs.createWriteStream(`./${dir}.zip`);
                const archive = archiver('zip');

                output.on('close', () => {
                    console.log(`Size of zip file -> ${archive.pointer()} bytes`);
                });

                output.on('end', () => {
                    console.log('Data has been drained');
                });

                output.on('error', (error) => {
                    throw error;
                })

                archive.on('error', (error) => {
                    throw error;
                })

                archive.pipe(output);

                archive.directory(dirPath, dirPath);
                return archive.finalize();
            });
        } catch (error) {
            console.error(error);
        }
    }
}
