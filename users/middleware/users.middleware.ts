import express from 'express';
import userService from '../services/users.service';
import debug from 'debug';
import { UnauthorizedError, ForbiddenError } from '../../common/errors/errors';

const debugLog: debug.IDebugger = debug('app:users-middleware');
class UsersMiddleware {

    async validateRequiredUserBodyFields(req: express.Request, res: express.Response, next: express.NextFunction) {
        debugLog('Validating required user body fields');
        if (req.body && req.body.email && req.body.password) {
            debugLog('Required fields present');
            next();
        } else {
            debugLog('Missing required fields');
            res.status(400).send({error: `Missing required fields email and password`});
        }
    }

    async validateSameEmailDoesntExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        debugLog(`Checking if email already exists: ${req.body.email}`);
        const user = await userService.getUserByEmail(req.body.email);
        if (user) {
            debugLog('Email already exists');
            res.status(400).send({error: `User email already exists`});
        } else {
            debugLog('Email is unique');
            next();
        }
    }

    validatePatchEmail = async(req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.body.email) {
            debugLog(`Validating patch email: ${req.body.email}`);
            next();
        } else {
            debugLog('No email in patch request');
            next();
        }
    }

    async validateUserExists(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            debugLog(`Checking if user exists with ID: ${req.params.userId}`);
            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }
            next();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }

    async extractUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
        debugLog(`Extracting user ID from params: ${req.params.userId}`);
        req.body.id = req.params.userId;
        debugLog('User ID added to request body');
        next();
    }
}

export default new UsersMiddleware();