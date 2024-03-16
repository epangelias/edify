import { FreshContext, PageProps, RouteContext } from '$fresh/server.ts';
import { Page } from '../components/Page.tsx';
import { UserData } from '../services/user.tsx';
import { Redirect } from '../services/web.ts';
import Editor from '../services/editor.tsx';
import db from '../services/db.ts';
import { EdifyConfig } from '../mod.ts';
import { ExtractFormData } from '../services/auto-form.tsx';

interface state  {
		path: string[];
		userData: UserData;
		edifyConfig: EdifyConfig;
}

export async function handler(req: Request, ctx: FreshContext<state>) {
	const { path, userData, edifyConfig } = ctx.state;
	if (!userData) return new Redirect('/edify/login');
	const title = path.join(' ▸ ') || 'Dashboard';

	try {
		const editor = await Editor(path, edifyConfig);
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
		});
	} catch (e) {
		if (e instanceof Redirect) return e;
		return new Response(e.message);
	}
}

export default function AppView({ data }: PageProps) {
	return (
		<Page title={data.title}>
			{data.content}
		</Page>
	);
}
