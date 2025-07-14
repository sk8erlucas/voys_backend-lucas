import { ForbiddenException, Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { MLToken } from '@prisma/client';
import axios from 'axios';
import * as qs from 'qs';
import { ErrorCodes } from '@src/errors/error-codes.enum';

@Injectable()
export class MLAuthService implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.prisma.$connect();
      }
    
      async onModuleDestroy() {
        await this.prisma.$disconnect();
      }
    
    
    async getAccessToken(code: string, state: string): Promise<MLToken> {

        const clientId = process.env.ML_CLIENT_ID;
        const clientSecret = process.env.ML_CLIENT_SECRET;
        const redirectUri = process.env.ML_REDIRECT_URI;
        const tokenUrl = 'https://api.mercadolibre.com/oauth/token';

        const store = await this.prisma.store.findUnique({
            where: { state }
        });

        if (!store) {

            throw new NotFoundException(ErrorCodes.RESOURCE_NOT_FOUND);

        }

        if (store.vinculated) {

            throw new ForbiddenException(ErrorCodes.ALREADY_VINCULATED_STORE);

        }

        try {
            const tokenResponse = await axios.post(
                tokenUrl,
                qs.stringify({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    redirect_uri: redirectUri,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            const MLUserData = await this.getMLUserData(tokenResponse.data.access_token);

            await this.prisma.store.update({
                where: { state },
                data: {
                    ml_fantazy_name: MLUserData.nickname,
                    ml_user_id: String(MLUserData.id),
                    vinculated: true
                }
            });

            const { access_token, refresh_token, token_type, expires_in, scope } = tokenResponse.data;

            const updatedMLToken = await this.prisma.mLToken.upsert({
                where: { store_id: store.id },
                update: {
                    ml_access_token: access_token,
                    ml_refresh_token: refresh_token,
                    ml_token_type: token_type,
                    ml_expires_in: expires_in,
                    ml_scope: scope,
                },
                create: {
                    ml_access_token: access_token,
                    ml_refresh_token: refresh_token,
                    ml_token_type: token_type,
                    ml_expires_in: expires_in,
                    ml_scope: scope,
                    store: {
                        connect: { id: store.id },
                    },
                },
            });

            return updatedMLToken;
        } catch (error) {
            throw new Error(`Failed to fetch access token: ${error.response?.data?.message || error.message}`);
        }
    }

    async refreshToken(storeId: number): Promise<MLToken> {
        const clientId = process.env.ML_CLIENT_ID;
        const clientSecret = process.env.ML_CLIENT_SECRET;
    
        const tokenData = await this.prisma.mLToken.findUnique({
            where: { store_id: storeId },
        });
    
        if (!tokenData) {
            throw new Error('Token data not found for the store');
        }
    
        const tokenUrl = 'https://api.mercadolibre.com/oauth/token';
        try {
            // Attempt to refresh the token
            const refreshResponse = await axios.post(
                tokenUrl,
                qs.stringify({
                    grant_type: 'refresh_token',
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: tokenData.ml_refresh_token,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
    
            const { access_token, refresh_token, expires_in, scope } = refreshResponse.data;
    
            // Update the token data in the database transactionally
            const updatedMLToken = await this.prisma.mLToken.update({
                where: { store_id: storeId },
                data: {
                    ml_access_token: access_token,
                    ml_refresh_token: refresh_token,
                    ml_expires_in: expires_in,
                    ml_scope: scope,
                },
            });
    
            return updatedMLToken;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error(`Failed to refresh token: ${errorMsg}`);
    
            // Handle cases of invalid or expired refresh tokens
            if (errorMsg.includes("expired") || errorMsg.includes("already used")) {
                console.error("Refresh token expired or invalid. Redirecting user to reauthorize.");
    
                // Clear the invalid token from the database or handle reauthorization
                await this.prisma.mLToken.update({
                    where: { store_id: storeId },
                    data: {
                        ml_access_token: null,
                        ml_refresh_token: null,
                        ml_expires_in: null,
                    },
                });
    
                // Optionally, throw an error with a reauthorization instruction
                throw new Error(
                    "Refresh token is expired or invalid. Please reauthorize the application. Visit: https://auth.mercadolibre.com.ar/authorization"
                );
            }
    
            // For other errors, rethrow them
            throw new Error(`Failed to refresh token: ${errorMsg}`);
        }
    }
    
    async getValidToken(storeId: number): Promise<MLToken> {
        const tokenData = await this.prisma.mLToken.findUnique({
            where: { store_id: storeId },
        });
    
        if (!tokenData) {
            throw new Error('Token data not found for the store');
        }
    
        // Check if the token is expired
        const isTokenExpired = (tokenData.updated_at.getTime() + tokenData.ml_expires_in * 1000) < Date.now();
    
        if (isTokenExpired) {
            try {
                return await this.refreshToken(storeId);
            } catch (error) {
                console.error("Failed to refresh token:", error.message);
                throw error;
            }
        }
    
        return tokenData;
    }
    
    
    

    async getMLUserData(accessToken: string): Promise<any> {
        try {
            const response = await axios.get('https://api.mercadolibre.com/users/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch ML user data: ${error.response?.data?.message || error.message}`);
        }
    }
}