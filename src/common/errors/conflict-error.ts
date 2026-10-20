import CustomAPIError from "./custom-error";

class ConflictError extends CustomAPIError{
    constructor(message: string){
        super(message, 409)
        this.statusCode = 409

        Object.setPrototypeOf(this, CustomAPIError.prototype)
    }
}
export default ConflictError