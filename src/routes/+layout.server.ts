
import type { LayoutServerLoad } from './$types'
// import { ANALYTICS_ID } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals: { session }, cookies }) => {
  return {
    session,
    cookies: cookies.getAll(),
       // ANALYTICS_ID
  }
}