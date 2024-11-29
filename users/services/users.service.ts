import UsersDao from '../daos/users.dao';
import {CRUD} from "../../common/interfaces/crud.interface";
import {UserDto, UserDtoPatch} from "../dto/user.dto";
import { UserRole } from '../models/user';

class UsersService implements CRUD<UserDto> {

    async create(resource: Omit<UserDto, 'id'>) {
        return UsersDao.addUser(resource);
    }

    async deleteById(resourceId: string) {
        return UsersDao.removeUserById(resourceId);
    };

    async list(limit: number, page: number) {
        return UsersDao.getUsers();
    };
    async patchById(resourceId: string, resource: UserDtoPatch) {
        console.log(`[UsersService] Patching user with ID: ${resourceId}`);
        console.log('[UsersService] Patch data:', JSON.stringify(resource, null, 2));
        
        const result = await UsersDao.patchUserById(resourceId, resource);
        
        if (result) {
            console.log('[UsersService] Successfully patched user:', JSON.stringify(result, null, 2));
        } else {
            console.warn('[UsersService] Failed to patch user - user not found');
        }
        
        return result;
    };

    async readById(resourceId: string) {
        return UsersDao.getUserById(resourceId);
    };

    async updateById(resourceId: string, resource: UserDto) {
        if (resource.permissionLevel === UserRole.GUEST) {
            throw new Error('Guests are not allowed to update users');
        }
        
        const { lastName, ...rest } = resource;
        return UsersDao.putUserById({ 
            ...rest,
            firstName: lastName,
            id: resourceId 
        });
    };

    async getUserByEmail(email: string) {
        return UsersDao.getUserByEmail(email);
    }
}

export default new UsersService();