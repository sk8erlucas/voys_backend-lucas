import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate( context: ExecutionContext): boolean {

    const roles: string[] = this.reflector.getAllAndOverride<string[]>('roles', 
      [context.getHandler(), context.getClass()]
    );
    
    if (!roles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();

    const { user } = request;
    

    const hasRole = () => roles.includes(user.role);

    return user && roles && hasRole();

  }
}
