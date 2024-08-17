import SFTPClient from 'ssh2-sftp-client';

export async function POST({ request }) {
  const sftp = new SFTPClient();
  const { directory } = await request.json();

  if (!directory) {
    return new Response('Directory is required', { status: 400 });
  }

  try {
    await sftp.connect({
      host: import.meta.env.VITE_SFTP_HOST,
      port: 22,
      username: import.meta.env.VITE_SFTP_USERNAME,
      password:import.meta.env.VITE_SFTP_PASSWORD,
    });

    const fileList = await sftp.list(directory);
    return new Response(JSON.stringify(fileList), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Failed to list files', { status: 500 });
  } finally {
    await sftp.end();
  }
}