import { Controller, Get, Param, ParseIntPipe, Query, Redirect, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { MLAuthService } from '@src/ml-auth/ml-auth.service';
import { Roles } from '@src/roles/decorators/roles.decorator';
import { RoleNames } from '@src/roles/roles.enum';
import { RolesGuard } from '@src/roles/roles.guard';
import { StoresAdminService } from '@src/stores/stores.admin.service';
import { StoresSellerService } from '@src/stores/stores.seller.service';

@Controller('ml-auth')
@ApiTags('ML Auth')

export class MLAuthController {
    constructor(
        private readonly mlAuthService: MLAuthService,
        private readonly storesSellerService: StoresSellerService,
        private readonly storesAdminService: StoresAdminService
    ) { }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleNames.ADMIN, RoleNames.SELLER)
    @Get('vinculation/:store_id')

    async generateAuthUrl(@Param('store_id', ParseIntPipe) id: number, @Request() req: any) {
        const { role } = req.user;
        let store = null;

        try {
            if (role === RoleNames.ADMIN) {
                store = await this.storesAdminService.findStoreById(id);
            } else if (role === RoleNames.SELLER) {
                store = await this.storesSellerService.findStoreById(id, req.user.userId);
            }

            // Verificar si la tienda fue encontrada
            if (!store) {
                throw new NotFoundException('Store not found');
            }

            const clientId = process.env.ML_CLIENT_ID;
            const redirectUri = process.env.ML_REDIRECT_URI;

            const authUrl = new URL('https://auth.mercadolibre.com.ar/authorization');
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('client_id', clientId);
            authUrl.searchParams.append('redirect_uri', redirectUri);
            authUrl.searchParams.append('state', store.state);
            return { url: authUrl };
        } catch (error) {
            // Manejo de errores
            throw new NotFoundException('Error retrieving store: ' + error.message);
        }
    }

    @Get('callback')
    @Redirect()
    async callback(@Query('code') code: string, @Query('state') state: string) {

        await this.mlAuthService.getAccessToken(code, state);

        return { url: `${process.env.FRONTEND_URL}`, statusCode: 302 };

    }

}