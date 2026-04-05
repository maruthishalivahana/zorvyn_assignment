import { type CookieOptions } from "express";
import { env } from "../config/env";

const getSecureCookieFlag = (): boolean => (env.authCookieSameSite === "none" ? true : env.authCookieSecure);

export const getAuthCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: getSecureCookieFlag(),
    sameSite: env.authCookieSameSite,
    path: "/",
    maxAge: env.authCookieMaxAgeMs,
    ...(env.authCookieDomain ? { domain: env.authCookieDomain } : {})
});

export const getAuthCookieClearOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: getSecureCookieFlag(),
    sameSite: env.authCookieSameSite,
    path: "/",
    ...(env.authCookieDomain ? { domain: env.authCookieDomain } : {})
});