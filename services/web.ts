import { setCookie } from '$std/http/cookie.ts';
import { getCookies } from '$std/http/cookie.ts';

interface CookieOptions {
	name?: string;
	value?: string;
	maxAge?: number;
}

export class Redirect extends Response {
	constructor(url: string) {
		const headers = new Headers();
		headers.set('Location', url);
		super(null, { status: 302, headers });
	}
	setCookie(req: Request, cookie: CookieOptions) {
		const { hostname, protocol } = new URL(req.url);
		setCookie(this.headers, {
			path: '/',
			httpOnly: true,
			sameSite: 'Lax',
			domain: hostname,
			secure: protocol == 'https:',
			value: '',
			name: '',
			maxAge: Number.MAX_SAFE_INTEGER,
			...cookie,
		});
		return this;
	}
}

export const GetCookies = getCookies;
