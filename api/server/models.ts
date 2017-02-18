export interface LocalVideo {
	_id?: string;

	deviceUuid?: string;
 	system?: string;
 	localAuthor?: boolean;

	originalPath?: string;	
	filename?: string;
 	transcodeProgress?:number;
 	transcoded?:boolean;
 	transcodedPath?: string;
 	
	uploadProgress?:number;
 	uploaded?:boolean;
 	remoteId?: string;

	downloadProgress?:number;
 	downloaded?: boolean;
}

export interface RemoteVideo {
	_id?: string;
	
	url?: string;
	relativeUrl?: string;
 	filename?: string;	
 	type?: string;
 	size?: number;

 	deviceUuid?: string;
 	system?: string;
}