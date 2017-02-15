export interface LocalVideo {
	_id?: string;
 	originalPath?: string;	
 	transcodeProgress?:number;
 	transcoded?:boolean;
 	transcodedPath?: string;
}