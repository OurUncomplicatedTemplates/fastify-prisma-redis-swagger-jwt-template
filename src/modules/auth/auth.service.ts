import { compareSync } from "bcrypt";
import { prisma } from "../../plugins/prisma";
import {
    accessTokenPayload,
    jwt,
    refreshTokenPayload,
} from "../../plugins/jwt";
import TimeUtil from "../../utils/time";
import { v4 } from "uuid";

export default class AuthService {
    public verifyPassword(userPassword: string, password: string): boolean {
        return compareSync(password, userPassword);
    }

    private createAccessToken(oldRefreshToken: string): {
        accessToken: string;
        accessTokenPayload: accessTokenPayload;
    } {
        const refreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

        const accessToken = jwt.signAccessToken({
            sub: refreshTokenObject.sub,
            iat: TimeUtil.getNowUnixTimeStamp(),
        });

        return {
            accessToken,
            accessTokenPayload: jwt.decodeAccessToken(accessToken),
        };
    }

    private async createRefreshToken(userId: number): Promise<{
        refreshToken: string;
        refreshTokenPayload: refreshTokenPayload;
    }> {
        const tokenFamily = v4();

        const refreshToken = jwt.signRefreshToken({
            sub: userId,
            iat: TimeUtil.getNowUnixTimeStamp(),
            aex: TimeUtil.getNowUnixTimeStamp() + 60 * 60 * 24 * 365,
            tokenFamily: tokenFamily,
        });

        await prisma.userSession.create({
            data: {
                refreshToken: refreshToken,
                tokenFamily: tokenFamily,
                userId: userId,
            },
        });

        return {
            refreshToken: refreshToken,
            refreshTokenPayload: jwt.decodeRefreshToken(refreshToken),
        };
    }

    private async createRefreshTokenByRefreshToken(
        oldRefreshToken: string
    ): Promise<{
        refreshToken: string;
        refreshTokenPayload: refreshTokenPayload;
    }> {
        const oldRefreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

        const refreshToken = jwt.signRefreshToken({
            sub: oldRefreshTokenObject.sub,
            iat: TimeUtil.getNowUnixTimeStamp(),
            aex: oldRefreshTokenObject.aex,
            tokenFamily: oldRefreshTokenObject.tokenFamily,
        });

        await prisma.userSession.update({
            where: {
                tokenFamily: oldRefreshTokenObject.tokenFamily,
            },
            data: {
                refreshToken: refreshToken,
            },
        });

        return {
            refreshToken: refreshToken,
            refreshTokenPayload: jwt.decodeRefreshToken(refreshToken),
        };
    }

    public async createTokens(userId: number): Promise<{
        refreshToken: string;
        refreshTokenPayload: refreshTokenPayload;
        accessToken: string;
        accessTokenPayload: accessTokenPayload;
    }> {
        const { refreshToken, refreshTokenPayload } =
            await this.createRefreshToken(userId);
        const { accessToken, accessTokenPayload } =
            this.createAccessToken(refreshToken);

        return {
            refreshToken: refreshToken,
            refreshTokenPayload: refreshTokenPayload,
            accessToken: accessToken,
            accessTokenPayload: accessTokenPayload,
        };
    }

    public async refreshByToken(oldRefreshToken: string): Promise<{
        refreshToken: string;
        refreshTokenPayload: refreshTokenPayload;
        accessToken: string;
        accessTokenPayload: accessTokenPayload;
    }> {
        jwt.verify(oldRefreshToken);

        const oldRefreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

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
            await prisma.userSession.delete({
                where: {
                    tokenFamily: oldRefreshTokenObject.tokenFamily,
                },
            });

            throw new Error("Refresh token has already been used");
        }

        const { refreshToken, refreshTokenPayload } =
            await this.createRefreshTokenByRefreshToken(oldRefreshToken);
        const { accessToken, accessTokenPayload } =
            this.createAccessToken(refreshToken);

        return {
            refreshToken: refreshToken,
            refreshTokenPayload: refreshTokenPayload,
            accessToken: accessToken,
            accessTokenPayload: accessTokenPayload,
        };
    }
}
