import { UserRole } from './user';

export class User {
    id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    permissionLevel: UserRole;

    constructor(
        id: string,
        email: string,
        password: string,
        firstName?: string,
        lastName?: string,
        permissionLevel: UserRole = UserRole.USER
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.permissionLevel = permissionLevel;
    }
}
