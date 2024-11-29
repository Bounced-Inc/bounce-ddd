import request from 'supertest';
import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import { UsersRoutes } from '../users.routes.config';
import * as bodyparser from 'body-parser';
import * as http from 'http';

describe('User API Integration Tests', () => {
    let app: express.Application;
    let server: http.Server;
    const routes: Array<CommonRoutesConfig> = [];

    const guestUser = {
        id: '1',
        token: '1',
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        permissionLevel: 'GUEST'
    };

    const regularUser = {
        id: '2',
        token: '2',
        email: 'jane.smith@example.com',
        password: 'password456',
        firstName: 'Jane',
        lastName: 'Smith',
        permissionLevel: 'USER'
    };

    const adminUser = {
        id: '3',
        token: '3',
        email: 'admin@example.com',
        password: 'adminpass',
        firstName: 'Admin',
        lastName: 'User',
        permissionLevel: 'ADMIN'
    };

    beforeAll((done) => {
        app = express();
        server = http.createServer(app);
        app.use(bodyparser.json());
        routes.push(new UsersRoutes(app));
        server.listen(0, () => {
            done();
        });
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    describe('GET /users', () => {
        it('should reject requests without authorization header', async () => {
            const response = await request(app).get('/users');
            expect(response.status).toBe(401);
        });

        it('should reject guest user access', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${guestUser.token}`);
            expect(response.status).toBe(403);
        });

        it('should allow regular user access', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${regularUser.token}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });

        it('should allow admin user access', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('GET /users/:userId', () => {
        it('should return user details for valid ID', async () => {
            const response = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body.email).toBe(regularUser.email);
        });

        it('should return 404 for invalid user ID', async () => {
            const response = await request(app)
                .get('/users/999999')
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(response.status).toBe(404);
        });

        it('should allow users to access their own data', async () => {
            const response = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body.email).toBe(regularUser.email);
        });

        it('should prevent users from accessing other users data', async () => {
            const response = await request(app)
                .get(`/users/${adminUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`);
            expect(response.status).toBe(403);
        });

        it('should allow guest users to access only their own data', async () => {
            const ownDataResponse = await request(app)
                .get(`/users/${guestUser.id}`)
                .set('Authorization', `Bearer ${guestUser.token}`);
            expect(ownDataResponse.status).toBe(200);
            expect(ownDataResponse.body.email).toBe(guestUser.email);

            const otherDataResponse = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${guestUser.token}`);
            expect(otherDataResponse.status).toBe(403);
        });
    });

    describe('POST /users', () => {
        it('should create a new user with valid data', async () => {
            const newUser = {
                email: 'newuser@example.com',
                password: 'newpass123',
                firstName: 'New',
                lastName: 'User'
            };

            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(newUser);
            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
        });

        it('should reject creation with existing email', async () => {
            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send({
                    email: adminUser.email,
                    password: 'somepass'
                });
            expect(response.status).toBe(400);
        });

        it('should reject creation without required fields', async () => {
            const response = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send({
                    firstName: 'Test'
                });
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /users/:userId', () => {
        it('should reject deletion by non-admin users', async () => {
            const response = await request(app)
                .delete(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`);
            expect(response.status).toBe(403);
        });

        it('should allow deletion by admin', async () => {
            const newUser = {
                email: 'todelete@example.com',
                password: 'deletepass'
            };

            const createResponse = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(newUser);

            expect(createResponse.status).toBe(201);
            expect(createResponse.body.id).toBeDefined();

            const getUserResponse = await request(app)
                .get(`/users/${createResponse.body.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(getUserResponse.status).toBe(200);

            const deleteResponse = await request(app)
                .delete(`/users/${createResponse.body.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(deleteResponse.status).toBe(204);

            const getDeletedUserResponse = await request(app)
                .get(`/users/${createResponse.body.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            expect(getDeletedUserResponse.status).toBe(404);
        });
    });

    describe('PATCH /users/:userId', () => {
        it('should update user fields partially', async () => {
            const originalUser = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            
            const update = {
                firstName: 'UpdatedName'
            };

            const response = await request(app)
                .patch(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(update);
            expect(response.status).toBe(200);

            const updatedUser = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);

            expect(updatedUser.body.firstName).toBe('UpdatedName');
            expect(updatedUser.body.lastName).toBe(originalUser.body.lastName);
            expect(updatedUser.body.email).toBe(originalUser.body.email);
            expect(updatedUser.body.permissionLevel).toBe(originalUser.body.permissionLevel);
        });

        it('users can update their own data', async () => {
            const update = { firstName: 'UpdatedRegularUser' };
            const response = await request(app)
                .patch(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`)
                .send(update);
            expect(response.status).toBe(200);
            expect(response.body.firstName).toBe('UpdatedRegularUser');
        });

        it('should prevent users from updating other users data', async () => {
            const update = { firstName: 'Hacked' };
            const response = await request(app)
                .patch(`/users/${adminUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`)
                .send(update);
            expect(response.status).toBe(403);
        });

        it('should prevent non-admin users from updating permission levels', async () => {
            const update = { permissionLevel: 'ADMIN' };
            const response = await request(app)
                .patch(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`)
                .send(update);
            expect(response.status).toBe(403);
        });

        it('should allow admin to update permission levels', async () => {
            const update = { permissionLevel: 'USER' };
            const response = await request(app)
                .patch(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(update);
            expect(response.status).toBe(200);
            expect(response.body.permissionLevel).toBe('USER');
        });
    });

    describe('PUT /users/:userId', () => {
        it('should update all user fields', async () => {
            const update = {
                email: 'newemail@example.com',
                password: 'newpassword123',
                firstName: 'Jane',
                lastName: 'Smith',
                permissionLevel: 'USER'
            };

            const response = await request(app)
                .put(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(update);
            expect(response.status).toBe(204);

            const getResponse = await request(app)
                .get(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`);
            
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.firstName).toBe('Jane');
        });

        it('should prevent users from updating other users', async () => {
            const update = {
                email: 'hacked@example.com',
                password: 'hacked123',
                firstName: 'Hacked',
                lastName: 'User',
                permissionLevel: 'USER'
            };

            const response = await request(app)
                .put(`/users/${adminUser.id}`)
                .set('Authorization', `Bearer ${regularUser.token}`)
                .send(update);
            expect(response.status).toBe(403);
        });

        it('should prevent setting guest permission level', async () => {
            const update = {
                email: 'test@example.com',
                password: 'test123',
                firstName: 'Test',
                lastName: 'User',
                permissionLevel: 'GUEST'
            };

            const response = await request(app)
                .put(`/users/${regularUser.id}`)
                .set('Authorization', `Bearer ${adminUser.token}`)
                .send(update);
            expect(response.status).toBe(403);
        });
    });

    describe('GET /users list filtering', () => {
        it('get data for guest user', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${guestUser.token}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(1);
            expect(response.body[0].id).toBe(guestUser.id);
        });

        it('should return all users for admin users', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminUser.token}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBeGreaterThan(1);
        });
    });
});
