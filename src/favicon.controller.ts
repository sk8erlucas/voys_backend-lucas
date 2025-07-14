import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class FaviconController {
  @Get('favicon.ico')
  handleFavicon(@Res() res: Response) {
    res.status(204).send(); // Retorna 204 "No Content"
  }
  @Get("/debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}
}
