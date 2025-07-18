export interface IFileUploadeResponse {
  url: string;
  path?: string;
}

export interface IFileUploader {
  upload(file: Express.Multer.File): Promise<IFileUploadeResponse>;
  delete(url: string): Promise<void>;
}
