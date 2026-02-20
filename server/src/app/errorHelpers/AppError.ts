import { TErrorSources } from "../interfaces/error.interface";

class AppError extends Error {


    stack?: string;
    constructor(public statusCode: number, message: 
        string, stack?: string) {
        super(message)
       if(stack){
        this.stack = stack
       }else{
        Error.captureStackTrace(this,this.constructor)
       }
    }
}


export default AppError