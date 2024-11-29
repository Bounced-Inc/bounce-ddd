import {CommonRoutesConfig} from '../common/common.routes.config';
import UsersController from './controllers/users.controller';
import UsersMiddleware from './middleware/users.middleware';
import AuthMiddleware from './middleware/auth.middleware';
import express from 'express';

export class UsersRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UsersRoutes');
    }

    configureRoutes() {
        this.app.route(`/users`)
            .get([
                AuthMiddleware.validateUserPermissions,
                UsersController.listUsers
            ])
            .post([
                UsersMiddleware.validateRequiredUserBodyFields,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            ]);

        this.app.param(`userId`, UsersMiddleware.extractUserId);
        this.app.route(`/users/:userId`)
            .all(UsersMiddleware.validateUserExists)
            .get(UsersController.getUserById)
            .delete([
                AuthMiddleware.validateAdminRole,
                UsersController.removeUser
            ]);

        this.app.put(`/users/:userId`,[
            UsersMiddleware.validateRequiredUserBodyFields,
            UsersController.put
        ]);

        this.app.patch(`/users/:userId`, [
            UsersMiddleware.validatePatchEmail,
            UsersController.patch
        ]);

        return this.app;
    }
}