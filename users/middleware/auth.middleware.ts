import express from 'express';
import usersService from '../services/users.service';
import { UserRole } from '../models/user';

class AuthMiddleware {
    private extractUserId = (req: express.Request): string | null => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.split(' ')[1];
    }

    validateAdminRole = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const userId = this.extractUserId(req);
        if (!userId) {
            return res.status(401).send({ error: 'User not authenticated' });
        }

        const user = await usersService.readById(userId);
        if (!user || user.permissionLevel !== UserRole.ADMIN) {
            return res.status(403).send({ error: 'Unauthorized: Admin access required' });
        }
        next();
    }

    validateUserPermissions = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const userId = this.extractUserId(req);
        if (!userId) {
            return res.status(401).send({ error: 'User not authenticated' });
        }

        const user = await usersService.readById(userId);
        if (!user || user.permissionLevel === UserRole.GUEST) {
            return res.status(403).send({ error: 'Unauthorized: User access required' });
        }
        next();
    }
}

export default new AuthMiddleware();
