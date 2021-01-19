import { AccessOptions } from 'basic-ftp';
import * as fs from 'fs';
import { FtpConnection } from './ftp-connection';

export interface IConfigData {
    ftp: AccessOptions
}

function getJsonConfig(): IConfigData {
    const rawJson = fs.readFileSync('config.json').toString();
    const configData: IConfigData = JSON.parse(rawJson);
    return configData;
}

const connection: FtpConnection = new FtpConnection();
connection.init(getJsonConfig().ftp)
    .then(response => connection.getZippedDir('world')
    .then()
    ).catch(error => console.error(error))
    .finally(() => console.log("file downloaded"));
