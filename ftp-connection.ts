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

            console.log(`Established connection to the ftp server...`)

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async getDir(dirPath: string): Promise<string> {
        console.log(`Getting '${dirPath}' directory...`);

        try {
            await this.client.downloadToDir('./' + dirPath, dirPath);
            return './' + dirPath;
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    public async getZippedDir(dirPath: string): Promise<string> {
        try {
            return await this.getDir(dirPath).then(async (dir) => {
                console.log(`Zipping '${dirPath}' directory...`);

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
                await archive.finalize();
                return `${dir}.zip`.substring(2);
            });
        } catch (error) {
            console.error(error);
        }
    }
}
