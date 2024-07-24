// src/routes/api/ftp/+server.ts
import { Client } from 'basic-ftp';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const FTP_CONFIG = {
    host: env.FTP_HOST,
    port: parseInt(env.FTP_PORT),
    user: env.FTP_USER,
    password: env.FTP_PASSWORD
};

export async function POST({ request }) {
    const client = new Client();
    client.ftp.verbose = true;

    try {
        console.log("Connecting to FTP with the following details:", FTP_CONFIG);
        await client.access(FTP_CONFIG);

        const { action, path } = await request.json();
        let result;

        switch (action) {
            case 'list':
                result = await client.list(path);
                break;
            // Additional cases for other FTP actions
        }

        return json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        return json({ success: false, error: message }, { status: 500 });
    } finally {
        client.close();
    }
}
