import {User} from "../models/users.model";

describe('User tests', () => {
    test('Sample test', () => {
        const aUser = new User('123', 'johndoe@example.com', 'password123', 'John', 'Doe');
        expect(aUser.id).toBe('123');
        expect(aUser.email).toBe('johndoe@example.com');
        expect(aUser.password).toBe('password123');
        expect(aUser.firstName).toBe('John');
        expect(aUser.lastName).toBe('Doe');
    });
});
