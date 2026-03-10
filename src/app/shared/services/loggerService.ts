import { Injectable } from '@angular/core';

@Injectable()
  export class LoggerService {
  
    constructor(){
    }

    public HandleError(err : any) : string
    {
        var errorMessage = "";
        if(err.error == null)
        {
            errorMessage = err.message;
        }
        else if(err.error.error == null)
        {
            errorMessage = err.error.Message;
        }
        else if(err.error.error.error == null)
        {
            errorMessage = err.error.error.Message;
        }

        return errorMessage;
    }
}
