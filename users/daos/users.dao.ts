import {UserDto} from "../dto/user.dto";
import shortid from "shortid";
import debug from 'debug';
import { UserRole } from "../models/user";
const log: debug.IDebugger = debug('app:in-memory-dao');

class UsersDao {
    users: Array<UserDto> = [];

    constructor() {
        log('Created new instance of UsersDao');
        this.users = [
            {
                id: '1',
                email: 'john.doe@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                permissionLevel: UserRole.GUEST
            },
            {
                id: '2',
                email: 'jane.smith@example.com',
                password: 'password456',
                firstName: 'Jane',
                lastName: 'Smith',
                permissionLevel: UserRole.USER
            },
            {
                id: '3',
                email: 'admin@example.com',
                password: 'adminpass',
                firstName: 'Admin',
                lastName: 'User',
                permissionLevel: UserRole.ADMIN
            }
        ];
    }

    async addUser(resource: Omit<UserDto, 'id'>): Promise<UserDto> {
        const user = {
            ...resource,
            id: shortid.generate()
        };
        this.users.push(user);
        return user;
    }

    async getUsers() {
        return this.users;
    }

    async getUserById(userId: string) {
        return this.users.find((user: { id: string; }) => user.id === userId);
    }

    async putUserById(user: UserDto) {
        const objIndex = this.users.findIndex((obj: { id: string; }) => obj.id === user.id);
        this.users.splice(objIndex, 1, user);
        return `${user.id} updated via put`;
    }

    async patchUserById(userId: string, user: Partial<UserDto>) {
        log(`Attempting to patch user with ID: ${userId}`);
        log('Patch data received: %O', user);

        log('Updating user fields...');
        this.users = this.users.map((existingUser, _index) => {
            if (existingUser.id === userId) {
                log('Found matching user: %O', existingUser);
                const updatedUser = {
                    ...existingUser,
                    email: user.email ?? existingUser.email,
                    password: user.password ?? existingUser.password,
                    firstName: user.firstName ?? existingUser.firstName,
                    lastName: user.lastName ?? existingUser.lastName,
                    permissionLevel: user.permissionLevel ?? existingUser.permissionLevel
                };
                log('Updated user data: %O', updatedUser);
                return updatedUser;
            }
            return existingUser;
        });

        const patchedUser = this.users.find(user => user.id === userId);
        if (patchedUser) {
            log('Successfully patched user');
        } else {
            log('User not found after patch operation');
        }
        return patchedUser;
    }


    async removeUserById(userId: string) {
        const objIndex = this.users.findIndex((obj: { id: string; }) => obj.id === userId);
        this.users.splice(objIndex, 1);
        return `${userId} removed`;
    }

    async getUserByEmail(email: string) {
        const objIndex = this.users.findIndex((obj: { email: string; }) => obj.email === email);
        let currentUser = this.users[objIndex];
        if (currentUser) {
            return currentUser;
        } else {
            return null;
        }
    }

    async searchUsers(searchTerm: string) {
        return this.users.filter((user: UserDto) => 
            user.email.includes(searchTerm) ||
            user.firstName?.includes(searchTerm) ||
            user.lastName?.includes(searchTerm)
        );
    }
}

export default new UsersDao();