import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import {NotFoundError, UnauthorizedError } from "../../common/errors";
import { ChangePasswordInput, DeleteAccountInput, UpdateProfileInput } from "./user.types";

export class UserService {
  constructor(private readonly repository = new UserRepository()) {}
  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    await this.getProfile(userId);
    return this.repository.updateProfile(userId, { name: data.name });
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.repository.findWithPassword(userId);

    if (!user) {
      throw new NotFoundError("User no longer exists");
    }

    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    await this.repository.changePasswordAndRevokeSessions(
      userId,
      newPasswordHash,
    );
  }

  async deleteAccount(userId: string, data: DeleteAccountInput) {
    const user = await this.repository.findWithPassword(userId);

    if (!user) {
      throw new NotFoundError("User no longer exists");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Password is incorrect");
    }

    await this.repository.deleteAccount(userId);
  }
}
