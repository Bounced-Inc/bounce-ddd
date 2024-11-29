export class UnauthorizedError extends Error {
    constructor(message: string = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    constructor(message: string = 'Forbidden access') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

export class UserNotFoundError extends Error {
    constructor(userId: string) {
        super(`User not found with ID: ${userId}`);
        this.name = 'UserNotFoundError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
