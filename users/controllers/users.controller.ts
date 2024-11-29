import express from 'express';
import usersService from '../services/users.service';
import argon2 from 'argon2';
import debug from 'debug';
import { UserConverter } from '../converters/user.converter';

const log: debug.IDebugger = debug('app:users-controller');
class UsersController {

    async listUsers(req: express.Request, res: express.Response) {
        const users = await usersService.list(100, 0);
        res.status(200).send(UserConverter.toDtoArray(users));
    }

    async getUserById(req: express.Request, res: express.Response) {
        const user = await usersService.readById(req.params.userId);
        if (user) {
            res.status(200).send(UserConverter.toDto(user));
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    }

    async createUser(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);
        const user = await usersService.create(UserConverter.toModel(req.body));
        res.status(201).send(user);
    }
    async patch(req: express.Request, res: express.Response) {
        if(req.body.password){
            req.body.password = await argon2.hash(req.body.password);
        }
        const result = await usersService.patchById(req.params.userId, UserConverter.toModel(req.body));
        res.status(200).send({ message: result });
    }

    async put(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);
        const result = await usersService.updateById(req.params.userId, UserConverter.toModel(req.body));
        res.status(200).send({ message: result });
    }

    async removeUser(req: express.Request, res: express.Response) {
        log(await usersService.deleteById(req.params.userId));
        res.status(204).send(``);
    }
}

export default new UsersController();