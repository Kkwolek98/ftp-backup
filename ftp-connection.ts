import { AccessOptions, Client } from 'basic-ftp';

export class FtpConnection {

    private client: Client;

    public async init(options: AccessOptions): Promise<any> {

        this.client = new Client();
        // this.client.ftp.verbose = true; 
        await this.client.access(options);
        return await this.client.list();
    }

    private onConnectionReady(): void {

        console.log(`Connected to ftp server`)
    }
}

const connection: FtpConnection = new FtpConnection();
connection.init({

}).then(list => console.log(list));
