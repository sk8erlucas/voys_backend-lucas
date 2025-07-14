/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./users/dto/create-user.dto"), { "CreateUserDto": { name: { required: true, type: () => String }, last_name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./users/dto/update-user.dto"), { "UpdateUserDto": {} }]], "controllers": [[import("./users/users.controller"), { "UsersController": { "createUser": {}, "getAllUsers": {}, "getUserById": {} } }]] } };
};