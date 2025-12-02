import {betterAuth} from "better-auth"
import {prisma} from "./prisma"

export const auth = betterAuth({
    database:{
        provider:"postgresql",
        client: prisma
    },
    emailAndPassword:{
        enabled:true,
        requiredEmailVerification:false,
    },
    session:{
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24, 
    },
    baseURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    basePath: '/api/auth',
})

export default auth 