import { FreshContext, PageProps, RouteContext } from '$fresh/server.ts';
import { Page } from '../components/Page.tsx';
import { UserData } from '../services/user.tsx';
import { Redirect } from '../services/web.ts';
import Editor from '../services/editor.tsx';
import db from '../services/db.ts';
import { EdifyConfig } from '../mod.ts';
import { ExtractFormData } from '../services/auto-form.tsx';
import { ValidateFormData } from '../services/auto-form.tsx';

interface state {
	path: string[];
	userData: UserData;
	edifyConfig: EdifyConfig;
}

export async function handler(req: Request, ctx: FreshContext<state>) {
	const { path, userData } = ctx.state;
	if (!userData) return new Redirect(ctx.state.edifyConfig.basePath + '/login');
	const title = path.join(' ▸ ') || 'Dashboard';

	try {
		const { content, fields } = await Editor(ctx.state);
		if (req.method == 'POST') {
			try {
				const data = await req.json();
				ValidateFormData(data, fields);
				const { ok } = await db.set(path, data);
				if (!ok) throw new Error('Error saving data');
				return Response.json({ message: 'Saved' });
			} catch (e) {
				return Response.json({ error: e.message });
			}
		}

		return ctx.render({ content, title });
	} catch (e) {
		if (e instanceof Redirect) return e;
		return new Response(e.message);
	}
}

export default function AppView({ data, state }: PageProps) {
	return (
		<Page title={data.title} state={state}>
			{data.content}
		</Page>
	);
}
