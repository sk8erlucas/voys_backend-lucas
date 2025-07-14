import { genSaltSync, hashSync, compareSync } from 'bcrypt';

export function hashPassword(password: string): string{

    const salt = genSaltSync(12)
    return hashSync(password, salt);

};

export function comparePassword(password: string, hashPassword: string): string{

    return compareSync(password, hashPassword);

};