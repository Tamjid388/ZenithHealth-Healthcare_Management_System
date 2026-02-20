export interface TErrorSources {
    path: string;
    message: string
}
export interface TErrorResponse{
    success:boolean;
    message:string;
    errorSource:TErrorSources[];
    error?:unknown;
    stack?:string;
    statusCode?:number
}
