import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '@src/users/dto/create-user.dto';
import { UpdateUserDto } from '@src/users/dto/update-user.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { User } from '@prisma/client'
import { hashPassword } from '@src/utils/bcrypt.util';
import { ErrorCodes } from '@src/errors/error-codes.enum';
import { PrismaErrorCodes } from '@src/errors/prisma-error-codes.enum';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) { }

  async createUser(user: CreateUserDto): Promise<User> {

    try {

      const {role_id, password, ...data} = user;

        /*
        data: { 
          ...data, 
          password: hashPassword(password), 
          role: { connect: { id: role_id } } 
        }
        */      

      return this.prisma.user.create({ 
        data: { 
          ...data, 
          password: hashPassword(password),
          role: { connect: { id: role_id } } 
        }

      });

    } catch (error) {

      if (error?.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) {

        throw new ForbiddenException(ErrorCodes.EMAIL_ALREADY_REGISTERED)

      }

      throw error;

    }

  }

  async findAllUsers() {

    return await this.prisma.user.findMany({
      omit: { password: true },
      include: {
        role: {
          select: {
            name: true
          }
        }
      }
    })

  }

  async findUserById(id: number) {

    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            name: true
          }
        }
      }
    });

  }

  async findUserByEmail(email: string) {

    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            name: true
          }
        }
      }
    });

  }

  async changePassword(id: number, password: string) {

    return await this.prisma.user.update({
      where: { id },
      omit: { password: true },
      data: { password: hashPassword(password) }
    })

  }

  async updateUser(id: number, User: UpdateUserDto) {

    const data = { ...User};

    if(data.password){

      data.password = hashPassword(User.password);

    }else{

      delete data.password;

    }

    return await this.prisma.user.update({
      where: { id },
      omit: { password: true },
      data: { ...data }
    })

  }

  async deleteUser(id: number) {

    try {

      return await this.prisma.user.delete({
        where: { id },
        omit: { password: true }
      })
      
    } catch (error) {

      if (error?.code === PrismaErrorCodes.REQUIRED_RECORDS_NOT_FOUND) {

        throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

      }

      throw error;

    }

  }

}
