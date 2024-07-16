// src/routes/(sidebar)/+page.ts
import type { PageLoad } from './$types';
import * as dashboard from './dashboard/+page';

export const load: PageLoad = (event) => {
    return dashboard.load(event);
};