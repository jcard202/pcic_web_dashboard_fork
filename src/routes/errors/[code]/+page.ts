// src/routes/errors/[code]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    const status = +(params.code ?? '');

    if (isNaN(status) || status < 400 || status > 599) {
        throw error(500, 'Wrong code');
    } else {
        const code = status as import('@sveltejs/kit').NumericRange<400,599>;
        return {
            status: code,
            error: 'Not found'
        };
    }
};