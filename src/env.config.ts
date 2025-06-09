import * as dotenv from 'dotenv';

dotenv.config();

export default {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    SALESFORCE_USERNAME: process.env.SALESFORCE_USERNAME ?? '',
    SALESFORCE_PASSWORD: process.env.SALESFORCE_PASSWORD ?? '',
    SALESFORCE_SECURITY_TOKEN: process.env.SALESFORCE_SECURITY_TOKEN ?? '',
    SALESFORCE_ACCESS_TOKEN: process.env.SALESFORCE_ACCESS_TOKEN ?? '',
    SALESFORCE_INSTANCE_URL: process.env.SALESFORCE_INSTANCE_URL ?? '',
}