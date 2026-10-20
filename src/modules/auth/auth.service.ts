import bcrypt from "bcrypt";

import { AuthRepository } from "./auth.repository.js";
import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
} from "../../common/utils/session.js";
import { LoginInput, LoginMetadata, RegisterInput } from "./auth.types.js";
import ConflictError from "../../common/errors/conflict-error.js";
import UnauthorizedError from "../../common/errors/unauthorized-error.js";

export class AuthService {
    constructor(
        private readonly repository = new AuthRepository()
    ){}

    async register(data: RegisterInput){
        const existingUser = await this.repository.findUserByEmail(data.email)

        if(existingUser){
            throw new ConflictError("Email already registered")
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        return this.repository.createUser({
            name: data.name,
            email: data.email,
            passwordHash,
        })
    }

    async login(data: LoginInput, metadata: LoginMetadata){
        const user = await this.repository.findUserByEmail(data.email)
        if(!user){
            throw new UnauthorizedError("Invalid credential")
        }

        const validPassword = await bcrypt.compare(data.password, user.passwordHash)
        if(!validPassword){
            throw new UnauthorizedError("Invalid credential")
        }

        const token = generateSessionToken();

        const session = await this.repository.createSession({
            userId: user.id,
            tokenHash: hashSessionToken(token),
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            expiresAt: getSessionExpiry(),
        })
        return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            sessionToken: token,
            expiresAt: session.expiresAt,
        };
    }

    async logout(sessionId: string){
        await this.repository.deleteSession(sessionId)
    }
}