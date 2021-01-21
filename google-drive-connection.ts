import { drive_v3, google, GoogleApis } from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
import * as fs from 'fs';
import * as readline from 'readline';

export class GoogleDriveConnection {

    readonly TOKEN_PATH: string = 'token.json';
    readonly SCOPES = ['https://www.googleapis.com/auth/drive'];

    private authClient: OAuth2Client;
    private drive: drive_v3.Drive;

    constructor(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials;

        this.authClient = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

        try {
            const token = fs.readFileSync(this.TOKEN_PATH).toString();
            this.authClient.setCredentials(JSON.parse(token));
            this.drive = google.drive({version: 'v3', auth: this.authClient});
        } catch {
            this.getAccessToken()
        }

    }


    public async getMainDirectory(): Promise<drive_v3.Schema$File[]> {
        return this.drive.files.list({
            pageSize: 99
        }).then(files => {
            console.log(files.data.files)
            return files.data.files;
        });
    }

    private getAccessToken(): void {
        const authUrl = this.authClient.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            this.authClient.getToken(code, (err, token) => {
              if (err) return console.error('Error retrieving access token', err);
              this.authClient.setCredentials(token);

              fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', this.TOKEN_PATH);
              });
            });
        });
    }

    public async uploadFile(path: string, fileName: string): Promise<string> {
        const metadata = {
            'name': fileName
        }
        const media = {
            mimeType: 'application/zip',
            body: fs.createReadStream(path)
        }
        return await this.drive.files.create({
            requestBody:  metadata,
            media,
            fields: 'id'
        }).then( (file) => {
                console.log(`File uploaded, ID ${file.data.id}`)
                return file.data.name;
        }).catch((error) => {
            console.error(error);
            return "";
        });
    }

    public async replaceFile(path: string, fileName: string): Promise<boolean> {
        const fileFound = await this.getMainDirectory().then((files) => {
            return files.find((file) => file.name === fileName);
        }).catch(() => null);
        

        if (fileFound) {
            const metadata = {
                'name': fileName
            }
            
            const media = {
                mimeType: 'application/zip',
                body: fs.createReadStream(path)
            }

            await this.drive.files.update({
                fileId: fileFound.id,
                requestBody:  metadata,
                media,
                fields: 'id'
            }).then((file) => {
                console.log(`File replaced, ID ${file.data.id}`)
                return true;
            }).catch((error) => {
                console.error(error);
                return false;
            }) 
        } else {
            return await this.uploadFile(path, fileName).then((name) => {
                return !!name.length;
            }).catch(() => {
                return false;
            });
        }
    }
}