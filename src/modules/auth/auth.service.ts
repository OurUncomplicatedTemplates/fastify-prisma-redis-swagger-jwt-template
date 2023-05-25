import { compareSync } from "bcrypt";
import { prisma } from "../../plugins/prisma";
import { jwt, token } from "../../plugins/jwt";
import TimeUtil from "../../utils/time";
import { v4 } from "uuid";

export default class AuthService {
    public verifyPassword(userPassword: string, password: string): boolean {
        return compareSync(password, userPassword);
    }

    private createAccessToken(oldRefreshToken: string): string {
        const refreshTokenObject = jwt.decode<token>(oldRefreshToken) as token;

        return jwt.sign(
            {
                sub: refreshTokenObject.sub,
                iat: TimeUtil.getNowUnixTimeStamp(),
                aex: refreshTokenObject.aex,
                tokenFamily: refreshTokenObject.tokenFamily,
            },
            { expiresIn: "10m" }
        );
    }

    private async createRefreshToken(
        userId: number,
        aex: number
    ): Promise<string> {
        const tokenFamily = v4();

        const refreshToken = jwt.sign(
            {
                sub: userId,
                iat: TimeUtil.getNowUnixTimeStamp(),
                aex: aex,
                tokenFamily: tokenFamily,
            },
            { expiresIn: "14d" }
        );

        await prisma.userSession.create({
            data: {
                refreshToken: refreshToken,
                tokenFamily: tokenFamily,
                userId: userId,
            },
        });

        return refreshToken;
    }

    private async createRefreshTokenByRefreshToken(
        oldRefreshToken: string
    ): Promise<string> {
        const oldRefreshTokenObject = jwt.decode<token>(
            oldRefreshToken
        ) as token;

        const refreshToken = jwt.sign(
            {
                sub: oldRefreshTokenObject.sub,
                iat: TimeUtil.getNowUnixTimeStamp(),
                aex: oldRefreshTokenObject.aex,
                tokenFamily: oldRefreshTokenObject.tokenFamily,
            },
            { expiresIn: "14d" }
        );

        await prisma.userSession.upsert({
            where: {
                tokenFamily: oldRefreshTokenObject.tokenFamily,
            },
            create: {
                refreshToken: refreshToken,
                tokenFamily: oldRefreshTokenObject.tokenFamily,
                user: {
                    connect: {
                        id: oldRefreshTokenObject.sub,
                    },
                },
            },
            update: {
                refreshToken: refreshToken,
            },
        });

        return refreshToken;
    }

    public async createTokens(
        userId: number
    ): Promise<{ refreshToken: string; accessToken: string }> {
        const aex = TimeUtil.getNowUnixTimeStamp() + 60 * 60 * 24 * 365;

        const refreshToken = await this.createRefreshToken(userId, aex);
        const accessToken = this.createAccessToken(refreshToken);

        return {
            refreshToken: refreshToken,
            accessToken: accessToken,
        };
    }

    public async refreshByToken(
        oldRefreshToken: string
    ): Promise<{ refreshToken: string; accessToken: string }> {
        const oldRefreshTokenObject = jwt.decode<token>(
            oldRefreshToken
        ) as token;

        if (oldRefreshTokenObject.aex < TimeUtil.getNowUnixTimeStamp()) {
            await prisma.userSession.delete({
                where: {
                    tokenFamily: oldRefreshTokenObject.tokenFamily,
                },
            });

            throw new Error("Refresh token has reached absolute expiry");
        }

        const userSession = await prisma.userSession.findFirst({
            where: {
                refreshToken: oldRefreshToken,
                userId: oldRefreshTokenObject.sub,
            },
        });

        if (!userSession) {
            const userSessionFromFamily = await prisma.userSession.findFirst({
                where: {
                    userId: oldRefreshTokenObject.sub,
                    tokenFamily: oldRefreshTokenObject.tokenFamily,
                },
            });

            if (userSessionFromFamily) {
                await prisma.userSession.delete({
                    where: {
                        tokenFamily: oldRefreshTokenObject.tokenFamily,
                    },
                });

                throw new Error("Refresh token has already been used");
            }

            throw new Error("Refresh token not found");
        }

        const refreshToken = await this.createRefreshTokenByRefreshToken(
            oldRefreshToken
        );
        const accessToken = this.createAccessToken(refreshToken);

        return {
            refreshToken: refreshToken,
            accessToken: accessToken,
        };
    }
}
