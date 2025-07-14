import metadata from './metadata';

describe('Metadata', () => {
  let metadataResult: any;

  beforeAll(async () => {
    metadataResult = await metadata();
  });

  it('debería devolver un objeto', async () => {
    expect(typeof metadataResult).toBe('object');
  });

  it('debería tener una propiedad @nestjs/swagger', () => {
    expect(metadataResult).toHaveProperty('@nestjs/swagger');
  });

  describe('@nestjs/swagger', () => {
    let swaggerMetadata: any;

    beforeAll(() => {
      swaggerMetadata = metadataResult['@nestjs/swagger'];
    });

    it('debería tener propiedades models y controllers', () => {
      expect(swaggerMetadata).toHaveProperty('models');
      expect(swaggerMetadata).toHaveProperty('controllers');
    });

    describe('models', () => {
      it('debería contener CreateUserDto', () => {
        const createUserDto = swaggerMetadata.models.find((model: any[]) => 
          model[1] && model[1].CreateUserDto
        );
        expect(createUserDto).toBeDefined();
      });

      it('CreateUserDto debería tener las propiedades correctas', () => {
        const createUserDto = swaggerMetadata.models.find((model: any[]) => 
          model[1] && model[1].CreateUserDto
        )[1].CreateUserDto;
        
        expect(createUserDto).toHaveProperty('name');
        expect(createUserDto).toHaveProperty('last_name');
        expect(createUserDto).toHaveProperty('email');
        expect(createUserDto).toHaveProperty('password');
      });
    });

    describe('controllers', () => {
      it('debería contener UsersController', () => {
        const usersController = swaggerMetadata.controllers.find((controller: any[]) => 
          controller[1] && controller[1].UsersController
        );
        expect(usersController).toBeDefined();
      });

      it('UsersController debería tener los métodos correctos', () => {
        const usersController = swaggerMetadata.controllers.find((controller: any[]) => 
          controller[1] && controller[1].UsersController
        )[1].UsersController;
        
        expect(usersController).toHaveProperty('createUser');
        expect(usersController).toHaveProperty('getAllUsers');
        expect(usersController).toHaveProperty('getUserById');
      });
    });
  });
});
