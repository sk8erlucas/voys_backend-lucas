import { BadRequestException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';

export function parseDate(dateString: string): Date {
    const parts = dateString.split('/');
    if (parts.length !== 3) {
        throw new BadRequestException(ErrorCodes.INVALID_DATE);
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Los meses son 0-indexados
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) {
        throw new BadRequestException(ErrorCodes.INVALID_DATE);
    }
    return date;
}