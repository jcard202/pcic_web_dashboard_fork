import SFTPClient from 'ssh2-sftp-client';

export async function POST({ request }) {
  const sftp = new SFTPClient();
  const { filePath } = await request.json();

  if (!filePath) {
    return new Response('File path is required', { status: 400 });
  }

  try {
    await sftp.connect({
      host: import.meta.env.VITE_SFTP_HOST,
      port: 22,
      username: import.meta.env.VITE_SFTP_USERNAME,
      password:import.meta.env.VITE_SFTP_PASSWORD,
    });

    const fileData = await sftp.get(filePath);
    return new Response(fileData.toString(), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Failed to retrieve file', { status: 500 });
  } finally {
    await sftp.end();
  }
}