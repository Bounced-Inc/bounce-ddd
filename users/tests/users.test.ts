import {User} from "../models/users.model";
import { UserRole } from '../models/userRole';

describe('User tests', () => {
    test('Sample test', () => {
        const aUser = new User('123', 'johndoe@example.com', 'password123', 'John', 'Doe', UserRole.USER);
        expect(aUser.id).toBe('123');
        expect(aUser.email).toBe('johndoe@example.com');
        expect(aUser.password).toBe('password123');
        expect(aUser.firstName).toBe('John');
        expect(aUser.lastName).toBe('Doe');
        expect(aUser.permissionLevel).toBe(UserRole.USER);
    });

    test('User with admin role', () => {
        const adminUser = new User(
            'admin123',
            'admin@example.com',
            'adminPass123',
            'Admin',
            'User',
            UserRole.ADMIN
        );
        
        expect(adminUser.id).toBe('admin123');
        expect(adminUser.email).toBe('admin@example.com');
        expect(adminUser.password).toBe('adminPass123');
        expect(adminUser.firstName).toBe('Admin');
        expect(adminUser.lastName).toBe('User');
        expect(adminUser.permissionLevel).toBe(UserRole.ADMIN);
        
        const minimalUser = new User('456', 'minimal@example.com', 'pass123');
        expect(minimalUser.firstName).toBeUndefined();
        expect(minimalUser.lastName).toBeUndefined();
        expect(minimalUser.permissionLevel).toBe(UserRole.USER);
    });

    describe('User creation and validation', () => {
        test('should create guest user with GUEST role', () => {
            const guestUser = new User(
                'guest123',
                'guest@example.com',
                'guestPass123',
                'Guest',
                'User',
                UserRole.GUEST
            );
            expect(guestUser.permissionLevel).toBe(UserRole.GUEST);
        });

        test('should handle empty optional fields', () => {
            const userWithoutName = new User(
                'noname123',
                'noname@example.com',
                'pass123'
            );
            expect(userWithoutName.firstName).toBeUndefined();
            expect(userWithoutName.lastName).toBeUndefined();
            expect(userWithoutName.permissionLevel).toBe(UserRole.USER);
        });

        test('should handle whitespace in names', () => {
            const userWithSpaces = new User(
                'space123',
                'space@example.com',
                'pass123',
                '  John  ',
                '  Doe  '
            );
            expect(userWithSpaces.firstName).toBe('  John  ');
            expect(userWithSpaces.lastName).toBe('  Doe  ');
        });

        test('should handle special characters in email', () => {
            const userWithSpecialEmail = new User(
                'special123',
                'user+test@example.com',
                'pass123'
            );
            expect(userWithSpecialEmail.email).toBe('user+test@example.com');
        });
    });

    describe('Permission level tests', () => {
        test('should handle all UserRole enum values', () => {
            const adminUser = new User('1', 'admin@test.com', 'pass', undefined, undefined, UserRole.ADMIN);
            const regularUser = new User('2', 'user@test.com', 'pass', undefined, undefined, UserRole.USER);
            const guestUser = new User('3', 'guest@test.com', 'pass', undefined, undefined, UserRole.GUEST);

            expect(adminUser.permissionLevel).toBe(UserRole.ADMIN);
            expect(regularUser.permissionLevel).toBe(UserRole.USER);
            expect(guestUser.permissionLevel).toBe(UserRole.GUEST);
        });

        test('should default to USER role when permission level is not provided', () => {
            const user = new User('123', 'test@example.com', 'pass123');
            expect(user.permissionLevel).toBe(UserRole.USER);
        });
    });

    describe('Edge cases', () => {
        test('should handle minimum length values', () => {
            const minUser = new User('a', 'a@b.c', 'p');
            expect(minUser.id).toBe('a');
            expect(minUser.email).toBe('a@b.c');
            expect(minUser.password).toBe('p');
        });

        test('should handle long values', () => {
            const longEmail = 'very.long.email.address.that.is.really.long@really.long.domain.name.com';
            const longName = 'Very Long Name That Contains Many Characters';
            const longUser = new User(
                'long123',
                longEmail,
                'pass123',
                longName,
                longName
            );
            expect(longUser.email).toBe(longEmail);
            expect(longUser.firstName).toBe(longName);
            expect(longUser.lastName).toBe(longName);
        });

        test('should handle email addresses with multiple @ symbols', () => {
            const user = new User('123', 'invalid@@email.com', 'pass123');
            expect(user.email).toBe('invalid@@email.com');
        });
    });

    describe('User comparison tests', () => {
        test('should create distinct users with same data', () => {
            const user1 = new User('123', 'test@example.com', 'pass123', 'John', 'Doe');
            const user2 = new User('123', 'test@example.com', 'pass123', 'John', 'Doe');
            
            expect(user1).not.toBe(user2);
            expect(user1.id).toBe(user2.id);
            expect(user1.email).toBe(user2.email);
            expect(user1.firstName).toBe(user2.firstName);
            expect(user1.lastName).toBe(user2.lastName);
        });

        test('should handle unicode characters in names', () => {
            const user = new User(
                '123',
                'test@example.com',
                'pass123',
                'José',
                'Señor'
            );
            expect(user.firstName).toBe('José');
            expect(user.lastName).toBe('Señor');
        });
    });
});
