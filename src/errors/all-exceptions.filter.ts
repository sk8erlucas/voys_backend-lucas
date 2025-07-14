import { BaseExceptionFilter } from "@nestjs/core";
import {
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
import { ErrorCodes } from "./error-codes.enum";
import { WithSentry } from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    private readonly logger = new Logger();

    @WithSentry()
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException
            ? exception.message
            : ErrorCodes.SERVER_ERROR;

        const responseBody = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message
        };

        this.logError(exception, request.url);

        // Send the response based on the framework (Express, Fastify, etc.)
        if (typeof response.status === 'function' && typeof response.json === 'function') {
            // Express response
            response.status(status).json(responseBody);
        } else if (typeof response.status === 'function' && typeof response.send === 'function') {
            // Fastify response
            response.status(status).send(responseBody);
        } else {
            // Fallback for other frameworks
            response.statusCode = status;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(responseBody));
        }
    }

    private logError(exception: unknown, url: string) {
        const moduleName = exception instanceof Error && exception.stack
            ? this.extractModuleName(exception.stack)
            : 'Unknown Module';

        const logMessage = `Error in ${moduleName}\nURL: ${url}\nException: ${exception instanceof Error ? exception.stack : exception}`;

        this.logger.error(logMessage, undefined, moduleName);
    }

    private extractModuleName(stack: string): string {
        const stackLines = stack.split('\n');
        for (const line of stackLines) {
            if (line.includes('node_modules')) continue;
            const match = line.match(/at\s+(.+?)\s+\((.+?):\d+:\d+\)/);
            if (match) {
                const [, funcName, filePath] = match;
                if (funcName !== 'Object.<anonymous>') {
                    return funcName;
                } else {
                    return filePath.split('/').pop() || 'Unknown Module';
                }
            }
        }
        return 'Unknown Module';
    }
}
