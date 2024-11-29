import UsersDao from '../daos/users.dao';
import {CRUD} from "../../common/interfaces/crud.interface";
import {UserDto} from "../dto/user.dto";
import { UserRole } from '../models/user';
import debug from 'debug';
import { UnauthorizedError, ForbiddenError, UserNotFoundError } from '../../common/errors/errors';
const log: debug.IDebugger = debug('app:users-service');

class UsersService implements CRUD<UserDto> {

    async create(resource: Omit<UserDto, 'id'>) {
        return UsersDao.addUser(resource);
    }

    async deleteById(resourceId: string, callingUserId: string) {
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        if (callingUser.permissionLevel !== UserRole.ADMIN) {
            throw new ForbiddenError('Only administrators can delete users');
        }

        const user = await UsersDao.getUserById(resourceId);
        if (!user) {
            throw new UserNotFoundError(resourceId);
        }

        await UsersDao.removeUserById(resourceId);
        return 'User deleted successfully';
    };

    async list(limit: number, page: number, callingUserId: string) {
        log('Listing users for caller:', callingUserId);
        
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        if (callingUser.permissionLevel === UserRole.GUEST) {
            log('Guest user - returning only their own data');
            const user = await UsersDao.getUserById(callingUserId);
            return user ? [user] : [];
        }

        return UsersDao.getUsers();
    };

    async patchById(resourceId: string, resource: Partial<UserDto>, callingUserId: string) {
        log(`Patching user ${resourceId} requested by ${callingUserId}`);
        
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        const targetUser = await UsersDao.getUserById(resourceId);
        if (!targetUser) {
            throw new UserNotFoundError(resourceId);
        }

        const isAdmin = callingUser.permissionLevel === UserRole.ADMIN;
        const isOwnData = callingUserId === resourceId;
        
        if (!isAdmin && !isOwnData) {
            throw new ForbiddenError('Can only modify own user data');
        }

        if (resource.permissionLevel !== undefined) {
            if (!isAdmin) {
                throw new ForbiddenError('Only administrators can modify permission levels');
            }
            if (resource.permissionLevel === UserRole.GUEST) {
                throw new ForbiddenError('Cannot set permission level to GUEST');
            }
        }

        const result = await UsersDao.patchUserById(resourceId, resource);
        if (!result) {
            throw new UserNotFoundError(resourceId);
        }

        return result;
    };

    async readById(resourceId: string, callingUserId: string) {
        log(`Reading user ${resourceId} requested by ${callingUserId}`);
        
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        if (callingUser.permissionLevel !== UserRole.ADMIN && 
            callingUserId !== resourceId) {
            throw new ForbiddenError('Can only access own user data');
        }

        const user = await UsersDao.getUserById(resourceId);
        if (!user) {
            throw new UserNotFoundError(resourceId);
        }

        return user;
    };

    async updateById(resourceId: string, resource: UserDto, callingUserId: string) {
        // First check the calling user's permissions
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        // Check if the calling user has permission to update this resource
        if (callingUser.permissionLevel !== UserRole.ADMIN && 
            callingUserId !== resourceId) {
            throw new ForbiddenError('Can only modify own user data');
        }

        const targetUser = await UsersDao.getUserById(resourceId);
        if (!targetUser) {
            throw new UserNotFoundError(resourceId);
        }

        if (resource.permissionLevel === UserRole.GUEST) {
            throw new ForbiddenError('Guests are not allowed to update users');
        }

        if (resource.permissionLevel !== undefined && 
            callingUser.permissionLevel !== UserRole.ADMIN) {
            throw new ForbiddenError('Only administrators can modify permission levels');
        }
        
        return UsersDao.putUserById({
            ...resource,
            id: resourceId
        });
    };

    async getUserByEmail(email: string) {
        return UsersDao.getUserByEmail(email);
    }

    async validatePatchChanges(resourceId: string, callingUserId: string, resource: Partial<UserDto>) {
        const callingUser = await UsersDao.getUserById(callingUserId);
        if (!callingUser) {
            throw new UnauthorizedError('Calling user not found');
        }

        if (callingUser.permissionLevel === UserRole.ADMIN) {
            return true;
        }

        if (callingUser.permissionLevel === UserRole.GUEST) {
            throw new ForbiddenError('Guests are not allowed to modify users');
        }

        if (callingUser.permissionLevel === UserRole.USER) {
            if (resourceId !== callingUserId) {
                throw new ForbiddenError('Users can only modify their own profile');
            }
            return true;
        }

        throw new ForbiddenError('Invalid permission level');
    }
}

export default new UsersService();