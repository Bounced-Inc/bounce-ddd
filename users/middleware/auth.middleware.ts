import express from 'express';
import usersService from '../services/users.service';
import { UserRole } from '../models/user';
import debug from 'debug';
import { UnauthorizedError, ForbiddenError } from '../../common/errors/errors';

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
        try {
            log('Validating admin role');
            const userId = this.extractUserId(req);
            if (!userId) {
                throw new UnauthorizedError('User not authenticated');
            }

            log(`Fetching user details for ID: ${userId}`);
            const user = await usersService.readById(userId, userId);
            if (!user || user.permissionLevel !== UserRole.ADMIN) {
                throw new ForbiddenError('Admin access required');
            }
            
            log('Admin role validated successfully');
            next();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }

    validateUserPermissions = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            log('Validating user permissions');
            const userId = this.extractUserId(req);
            if (!userId) {
                throw new UnauthorizedError('User not authenticated');
            }

            log(`Fetching user details for ID: ${userId}`);
            const user = await usersService.readById(userId, userId);
            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            log('User permissions validated successfully');
            next();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }
}

export default new AuthMiddleware();
