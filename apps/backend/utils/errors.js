export class StateTransitionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StateTransitionError';
        this.statusCode = 400;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

export class ContractViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ContractViolationError';
        this.statusCode = 500; // Internal error: the backend is returning invalid data
    }
}
