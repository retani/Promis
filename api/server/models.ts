export interface LocalVideo {
	_id?: string;
 	filename?: string;
 	originalPath?: string;	
 	transcodeProgress?:number;
 	transcoded?:boolean;
 	transcodedPath?: string;
 	deviceUuid?: string,
 	system?: string,
 	uploadProgress?:number;
 	uploaded?:boolean;
}

export interface RemoteVideo {
	_id?: string;
 	deviceUuid?: string,
 	system?: string
 	remoteUri?: string;
 	downloadProgress?:number;
 	downloaded?: boolean;
 	localPath?: string;	
}