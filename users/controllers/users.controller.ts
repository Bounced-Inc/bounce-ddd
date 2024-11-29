import express from 'express';
import usersService from '../services/users.service';
import argon2 from 'argon2';
import debug from 'debug';
import { UserConverter } from '../converters/user.converter';

const debugLog: debug.IDebugger = debug('app:users-controller');

class UsersController {

    async listUsers(req: express.Request, res: express.Response) {
        debugLog('Listing users');
        const users = await usersService.list(100, 0);
        debugLog(`Found ${users.length} users`);
        const dtos = UserConverter.toDtoArray(users);
        debugLog('Converted users to DTOs');
        res.status(200).send(dtos);
        debugLog('Users list response sent');
    }

    async getUserById(req: express.Request, res: express.Response) {
        debugLog(`Getting user by ID: ${req.params.userId}`);
        const user = await usersService.readById(req.params.userId);
        if (user) {
            debugLog('User found, converting to DTO');
            const dto = UserConverter.toDto(user);
            res.status(200).send(dto);
            debugLog('User details sent');
        } else {
            debugLog('User not found');
            res.status(404).send({ error: 'User not found' });
            debugLog('Not found response sent');
        }
    }

    async createUser(req: express.Request, res: express.Response) {
        debugLog('Creating new user');
        debugLog('Hashing password');
        req.body.password = await argon2.hash(req.body.password);
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
        debugLog(`Attempting to patch user with ID: ${req.params.userId}`);
        debugLog('Received patch data:', JSON.stringify(req.body, null, 2));

        if(req.body.password){
            debugLog('Hashing password');
            req.body.password = await argon2.hash(req.body.password);
            debugLog('Password hashed successfully');
        }

        debugLog('Converting request body to model');
        const modelData = UserConverter.toModel(req.body);
        debugLog('Converted data:', JSON.stringify(modelData, null, 2));

        debugLog('Calling service to patch user');
        const result = await usersService.patchById(req.params.userId, modelData);
        
        if (result) {
            debugLog('Successfully patched user');
            debugLog('Patch result:', JSON.stringify(result, null, 2));
        } else {
            debugLog('Failed to patch user - no result returned');
        }

        res.status(200).send({ message: result });
        debugLog('Sent response to client');
    }

    async put(req: express.Request, res: express.Response) {
        debugLog(`Updating user with ID: ${req.params.userId}`);
        debugLog('Hashing password');
        req.body.password = await argon2.hash(req.body.password);
        debugLog('Password hashed');

        debugLog('Converting request to user model');
        const userModel = UserConverter.toModel(req.body);
        debugLog('Updating user in service');
        const result = await usersService.updateById(req.params.userId, userModel);
        debugLog('User updated successfully');

        res.status(200).send({ message: result });
        debugLog('Update response sent');
    }

    async removeUser(req: express.Request, res: express.Response) {
        debugLog(`Removing user with ID: ${req.params.userId}`);
        const result = await usersService.deleteById(req.params.userId);
        debugLog('Delete result:', result);
        res.status(204).send(``);
        debugLog('Delete response sent');
    }
}

export default new UsersController();