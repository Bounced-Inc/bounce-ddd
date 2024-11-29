import {User} from "../models/users.model";
import { UserRole } from '../models/user';

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
        
        // Test optional fields
        const minimalUser = new User('456', 'minimal@example.com', 'pass123');
        expect(minimalUser.firstName).toBeUndefined();
        expect(minimalUser.lastName).toBeUndefined();
        expect(minimalUser.permissionLevel).toBe(UserRole.USER); // Should default to USER role
    });
});
