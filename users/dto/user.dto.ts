import { UserRole } from '../models/user';

export interface UserDto {
   id: string;
   email: string;
   password: string;
   firstName?: string;
   lastName?: string;
   permissionLevel: UserRole;
}

export interface UserDtoPatch {
   email?: string;
   password?: string;
   firstName?: string;
   lastName?: string;
   permissionLevel?: UserRole;
}