import { test, expect } from '@playwright/test';
import { ZodError } from 'zod';
import { signupSchema, loginSchema, resetPasswordParamsSchema } from '../../schemas/auth.schema.js';
import { transformProjectSchema, transformProjectsSchema } from '../../schemas/zoho.schema.js';
import { uuidParam, idParamSchema } from '../../schemas/common.schema.js';
import { formatZodError } from '../../utils/formatZodError.js';

test.describe('auth.schema.js', () => {
    test('signup: missing required fields are rejected', () => {
        expect(() => signupSchema.parse({})).toThrow(ZodError);
    });

    test('signup: bad email format is rejected', () => {
        expect(() => signupSchema.parse({ email: 'not-an-email', password: 'longenough', fullName: 'A' })).toThrow(ZodError);
    });

    test('signup: short password is rejected', () => {
        expect(() => signupSchema.parse({ email: 'a@b.com', password: 'short', fullName: 'A' })).toThrow(ZodError);
    });

    test('signup: valid payload passes', () => {
        const result = signupSchema.parse({ email: 'a@b.com', password: 'longenough', fullName: 'Ada' });
        expect(result.email).toBe('a@b.com');
    });

    test('login: missing password is rejected', () => {
        expect(() => loginSchema.parse({ email: 'a@b.com' })).toThrow(ZodError);
    });

    test('resetPasswordParams: missing token is rejected', () => {
        expect(() => resetPasswordParamsSchema.parse({})).toThrow(ZodError);
    });
});

test.describe('zoho.schema.js', () => {
    test('transformProject: rejects null', () => {
        expect(() => transformProjectSchema.parse(null)).toThrow(ZodError);
    });

    test('transformProject: rejects a string', () => {
        expect(() => transformProjectSchema.parse('not an object')).toThrow(ZodError);
    });

    test('transformProject: rejects an array', () => {
        expect(() => transformProjectSchema.parse([1, 2, 3])).toThrow(ZodError);
    });

    test('transformProject: accepts any plain object, even with unknown Zoho field names', () => {
        const result = transformProjectSchema.parse({ Project_Name: 'X', weirdField: 123 });
        expect(result.Project_Name).toBe('X');
    });

    test('transformProjects: accepts a bare array', () => {
        const result = transformProjectsSchema.parse([{ id: 1 }, { id: 2 }]);
        expect(Array.isArray(result)).toBe(true);
    });

    test('transformProjects: accepts { projects: [...] }', () => {
        const result = transformProjectsSchema.parse({ projects: [{ id: 1 }] });
        expect(result.projects.length).toBe(1);
    });

    test('transformProjects: rejects a bare object with no projects key', () => {
        expect(() => transformProjectsSchema.parse({ id: 1 })).toThrow(ZodError);
    });
});

test.describe('common.schema.js', () => {
    test('idParamSchema: rejects a malformed id', () => {
        expect(() => idParamSchema.parse({ id: 'not-a-uuid' })).toThrow(ZodError);
    });

    test('idParamSchema: accepts a real UUID', () => {
        const result = idParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' });
        expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    test('uuidParam: works for an arbitrary param name', () => {
        const schema = uuidParam('projectId');
        expect(() => schema.parse({ projectId: 'bad' })).toThrow(ZodError);
        const result = schema.parse({ projectId: '123e4567-e89b-12d3-a456-426614174000' });
        expect(result.projectId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
});

test.describe('formatZodError.js', () => {
    test('formats a single missing-field error into { field, message }', () => {
        let caught;
        try {
            loginSchema.parse({});
        } catch (err) {
            caught = err;
        }
        const formatted = formatZodError(caught);
        expect(formatted.errors.length).toBeGreaterThan(0);
        expect(formatted.errors[0]).toHaveProperty('field');
        expect(formatted.errors[0]).toHaveProperty('message');
    });

    test('maps nested path to a dotted field name', () => {
        let caught;
        try {
            transformProjectsSchema.parse({ projects: 'not-an-array' });
        } catch (err) {
            caught = err;
        }
        const formatted = formatZodError(caught);
        expect(formatted.errors.some((e) => e.field.includes('projects'))).toBe(true);
    });
});
