// src/routes/utils/variables.ts
export const imgDir = 'https://flowbite-admin-dashboard.vercel.app/images';

/** @type {(x:string) => string} */
export const avatarPath = (src: string) => imgDir + '/users/' + src;

/** @type {(x:string, ...y:string[]) => string} */
export const imagesPath = (src: string, ...subdirs: string[]) => [imgDir, ...subdirs, src].filter(Boolean).join('/');