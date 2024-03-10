import { FreshContext, PageProps, RouteContext } from '$fresh/server.ts';
import { Page } from '../components/Page.tsx';
import { UserData } from '../services/user.tsx';
import { Redirect } from '../services/web.ts';
import Editor from '../services/editor.tsx';
import { CreateForm, GetFormData, SetDataToFields, ValidateFormData } from '../services/auto-form.tsx';
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
		const fields = editor.getFields();

		if (req.method == 'POST') {
			const formData = await GetFormData(req, fields);
			editor.setDataAndValidate(formData);
			const { ok } = await db.set(path, formData);
			if (!ok) throw new Error('Error saving data');
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
