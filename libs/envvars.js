import dotenv from 'dotenv';

dotenv.config({ path: '.env'})

const ENVARS = {
    PORT: process.env.PORT,
    FE_URL: process.env.FE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
}

export default ENVARS;