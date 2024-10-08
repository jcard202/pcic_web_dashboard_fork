// src/routes/(sidebar)/layouts/sidebar/+page.ts
import type { PageLoad } from './$types';
import * as dashboard from '../../../(sidebar)/dashboard/+page';

export const load: PageLoad = (event) => {
    return dashboard.load(event);
};