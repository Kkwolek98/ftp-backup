import { AccessOptions, Client } from 'basic-ftp';

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

    public async getDir(dirPath: string): Promise<boolean> {

        try {
            await this.client.downloadToDir('./world', dirPath);
            return true;
        } catch (error) {
            console.error(error);
            return false
        }
    }
}

const connection: FtpConnection = new FtpConnection();
connection.init({

}).then(response => connection.getDir('world').then(world => console.log(world)));
