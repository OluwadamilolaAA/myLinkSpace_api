import CustomAPIError from "./custom-error";

class ForiddenError extends CustomAPIError{
   constructor(message: string){
    super(message, 403),
    this.statusCode = 403
    Object.setPrototypeOf(this, CustomAPIError.prototype)
   }
};
export default ForiddenError