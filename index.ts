import { GoogleDriveConnection } from './google-drive-connection';
import { AccessOptions } from 'basic-ftp';
import * as fs from 'fs';
import { FtpConnection } from './ftp-connection';

export interface IConfigData {
    ftp: AccessOptions,
    installed: any;
}

function getJsonConfig(): IConfigData {
    const rawJson = fs.readFileSync('config.json').toString();
    const configData: IConfigData = JSON.parse(rawJson);
    return configData;
}

async function uploadFile(): Promise<any> {
    const drive: GoogleDriveConnection = new GoogleDriveConnection(getJsonConfig().installed);
    return await drive.replaceFile('world.zip', 'world.zip');
}

async function downloadFile(): Promise<string> {
    const ftp: FtpConnection = new FtpConnection();
    const file = await ftp.init(getJsonConfig().ftp)
        .then((_response) => ftp.getZippedDir('world')
        .then((fileName) => {
            return fileName;
        })
        ).catch(error => {
            console.error(error)
            return '';
        })
    return file;
}

downloadFile().then( (fileName) => {
    uploadFile().then(() => process.exit());
});