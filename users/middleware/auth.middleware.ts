import express from 'express';
import usersService from '../services/users.service';
import { UserRole } from '../models/user';
import debug from 'debug';

const log: debug.IDebugger = debug('app:auth-middleware');

class AuthMiddleware {
    private extractUserId = (req: express.Request): string | null => {
        log('Extracting user ID from authorization header');
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            log('Invalid or missing Bearer token');
            return null;
        }
        const userId = authHeader.split(' ')[1];
        log(`Extracted user ID: ${userId}`);
        return userId;
    }

    validateAdminRole = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        log('Validating admin role');
        const userId = this.extractUserId(req);
        if (!userId) {
            log('User not authenticated - returning 401');
            return res.status(401).send({ error: 'User not authenticated' });
        }

        log(`Fetching user details for ID: ${userId}`);
        const user = await usersService.readById(userId);
        if (!user || user.permissionLevel !== UserRole.ADMIN) {
            log('User does not have admin permissions - returning 403');
            return res.status(403).send({ error: 'Unauthorized: Admin access required' });
        }
        log('Admin role validated successfully');
        next();
    }

    validateUserPermissions = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        log('Validating user permissions');
        const userId = this.extractUserId(req);
        if (!userId) {
            log('User not authenticated - returning 401');
            return res.status(401).send({ error: 'User not authenticated' });
        }

        log(`Fetching user details for ID: ${userId}`);
        const user = await usersService.readById(userId);
        if (!user || user.permissionLevel === UserRole.GUEST) {
            log('User has insufficient permissions - returning 403');
            return res.status(403).send({ error: 'Unauthorized: User access required' });
        }
        log('User permissions validated successfully');
        next();
    }
}

export default new AuthMiddleware();
