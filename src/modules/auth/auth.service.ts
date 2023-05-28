import { compareSync } from "bcrypt";
import { prisma } from "../../plugins/prisma";
import { jwt } from "../../plugins/jwt";
import TimeUtil from "../../utils/time";
import { v4 } from "uuid";

export default class AuthService {
    public verifyPassword(userPassword: string, password: string): boolean {
        return compareSync(password, userPassword);
    }

    private createAccessToken(oldRefreshToken: string): string {
        const refreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

        return jwt.signAccessToken({
            sub: refreshTokenObject.sub,
            iat: TimeUtil.getNowUnixTimeStamp(),
        });
    }

    private async createRefreshToken(userId: number): Promise<string> {
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

        return refreshToken;
    }

    private async createRefreshTokenByRefreshToken(
        oldRefreshToken: string
    ): Promise<string> {
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

        return refreshToken;
    }

    public async createTokens(
        userId: number
    ): Promise<{ refreshToken: string; accessToken: string }> {
        const refreshToken = await this.createRefreshToken(userId);
        const accessToken = this.createAccessToken(refreshToken);

        return {
            refreshToken: refreshToken,
            accessToken: accessToken,
        };
    }

    public async refreshByToken(
        oldRefreshToken: string
    ): Promise<{ refreshToken: string; accessToken: string }> {
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
