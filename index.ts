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

const ftp: FtpConnection = new FtpConnection();
ftp.init(getJsonConfig().ftp)
    .then(response => ftp.getZippedDir('world')
    .then()
    ).catch(error => console.error(error))
    .finally(() => console.log("file downloaded"));

const drive: GoogleDriveConnection = new GoogleDriveConnection(getJsonConfig().installed);
drive.updateFile('world.zip', 'world.zip');