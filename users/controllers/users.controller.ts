import express from 'express';
import usersService from '../services/users.service';
import debug from 'debug';
import { UserConverter } from '../converters/user.converter';
import { UnauthorizedError, ForbiddenError, UserNotFoundError } from '../../common/errors/errors';
import { hashPassword } from '../../common/utils/password';

const debugLog: debug.IDebugger = debug('app:users-controller');

class UsersController {

    async listUsers(req: express.Request, res: express.Response) {
        try {
            debugLog('Listing users');
            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }

            const users = await usersService.list(100, 0, callingUserId);
            const dtos = UserConverter.toDtoArray(users);
            res.status(200).send(dtos);
        } catch (error) {
            debugLog('Error in listUsers:', error);
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else if (error instanceof UserNotFoundError) {
                res.status(404).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }

    async getUserById(req: express.Request, res: express.Response) {
        try {
            debugLog('Getting user by ID');
            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }

            const user = await usersService.readById(req.params.userId, callingUserId);
            const dto = UserConverter.toDto(user);
            res.status(200).send(dto);
        } catch (error) {
            debugLog('Error in getUserById:', error);
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else if (error instanceof UserNotFoundError) {
                res.status(404).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }

    async createUser(req: express.Request, res: express.Response) {
        debugLog('Creating new user');
        debugLog('Hashing password');
        req.body.password = hashPassword(req.body.password);
        debugLog('Password hashed');
        
        debugLog('Converting request to user model');
        const userModel = UserConverter.toModel(req.body);
        debugLog('Creating user in service');
        const user = await usersService.create(userModel);
        debugLog('User created successfully');
        
        res.status(201).send(user);
        debugLog('Create user response sent');
    }

    async patch(req: express.Request, res: express.Response) {
        try {
            debugLog(`Attempting to patch user with ID: ${req.params.userId}`);
            debugLog('Received patch data:', JSON.stringify(req.body, null, 2));

            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }

            if(req.body.password){
                debugLog('Hashing password');
                req.body.password = hashPassword(req.body.password);
            }

            const patchData = UserConverter.toPatchModel(req.body);
            debugLog('Converted patch data:', patchData);

            const result = await usersService.patchById(
                req.params.userId,
                patchData,
                callingUserId
            );
            
            res.status(200).send(result);
        } catch (error) {
            debugLog('Error during patch:', error);
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else if (error instanceof UserNotFoundError) {
                res.status(404).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }

    async put(req: express.Request, res: express.Response) {
        try {
            debugLog(`Updating user with ID: ${req.params.userId}`);
            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }

            debugLog('Hashing password');
            req.body.password = hashPassword(req.body.password);
            debugLog('Password hashed');

            debugLog('Converting request to user model');
            const userModel = UserConverter.toModel(req.body);
            debugLog('Updating user in service');
            const result = await usersService.updateById(req.params.userId, userModel, callingUserId);
            debugLog('User updated successfully');

            res.status(200).send({ message: result });
            debugLog('Update response sent');
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

    async removeUser(req: express.Request, res: express.Response) {
        try {
            debugLog(`Removing user with ID: ${req.params.userId}`);
            const callingUserId = req.headers.authorization?.split(' ')[1];
            if (!callingUserId) {
                throw new UnauthorizedError('No authorization token');
            }

            const result = await usersService.deleteById(req.params.userId, callingUserId);
            debugLog('Delete result:', result);
            res.status(204).send(``);
            debugLog('Delete response sent');
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                res.status(401).send({ error: error.message });
            } else if (error instanceof ForbiddenError) {
                res.status(403).send({ error: error.message });
            } else if (error instanceof UserNotFoundError) {
                res.status(404).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Internal server error' });
            }
        }
    }
}

export default new UsersController();