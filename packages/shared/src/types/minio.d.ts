declare module 'minio' {
    export class Client {
        constructor(options: any);
        bucketExists(bucketName: string): Promise<boolean>;
        makeBucket(bucketName: string, region: string): Promise<void>;
        putObject(bucketName: string, objectName: string, stream: any, size?: number, metaData?: any): Promise<any>;
        getObject(bucketName: string, objectName: string): Promise<any>;
    }
}
