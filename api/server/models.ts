export interface LocalVideo {
	_id?: string;
	title?:string;
	thumbPath?: string;

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
	title?:string;
	
	url?: string;
	relativeUrl?: string;
 	filename?: string;	
 	type?: string;
 	size?: number;

 	thumbUrl?: string;
 	thumbFilename?: string;

 	deviceUuid?: string;
 	system?: string;
}

export interface LocalSettings {
	_id?: string;
	name: string;
	currentLat: number;
	currentLng: number;
	currentZoom: number;
}