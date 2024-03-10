import { FreshContext } from '$fresh/server.ts';
import { getUserByAuth } from '../services/user.tsx';
import { GetCookies } from '../services/web.ts';

export default async function handler(req: Request, ctx: FreshContext) {
	ctx.state.userData = await getUserByAuth(GetCookies(req.headers).auth);
	ctx.state.path = ctx.params?.path?.split('/');
	return await ctx.next();
}
