import { FreshContext, PageProps, RouteContext } from '$fresh/server.ts';
import { Page } from '../components/Page.tsx';
import { UserData } from '../services/user.tsx';
import { Redirect } from '../services/web.ts';
import Editor from '../services/editor.tsx';
import db from '../services/db.ts';

interface CTX extends FreshContext {
	state: {
		path: string[];
		userData: UserData;
	};
}

export async function handler(req: Request, ctx: CTX) {
	const { path, userData } = ctx.state;
	if (!userData) return new Redirect('/edify/login');
	const title = path.join(' ▸ ') || 'Dashboard';

	try {
		const editor = await Editor(path);
		if (req.method == 'POST') {
			try {
				const data = await req.json();
				editor.validate(data);
				const { ok } = await db.set(path, data);
				if (!ok) throw new Error('Error saving data');
				return Response.json({ message: 'Saved' });
			} catch (e) {
				return Response.json({ error: e.message });
			}
		}

		return ctx.render({
			content: await editor.getContent(),
			title,
			plain: ctx.url.searchParams.get('plain'),
		});
	} catch (e) {
		if (e instanceof Redirect) return e;
		return new Response(e.message);
	}
}

export default function AppView({ data }: PageProps) {
	return (
		<Page title={data.title} plain={data.plain}>
			{data.content}
		</Page>
	);
}
