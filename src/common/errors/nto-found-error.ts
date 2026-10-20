import CustomAPIError from "./custom-error";

class NotfoundError extends CustomAPIError{
   constructor(message: string){
    super(message, 404),
    this.statusCode = 404
    Object.setPrototypeOf(this, CustomAPIError.prototype)
   }
};
export default NotfoundError