import { Field } from '../services/auto-form.tsx';
import { FreshContext } from '$fresh/server.ts';
import { validateAndAuthorize } from '../services/user.tsx';
import { Page } from '../components/Page.tsx';
import { AutoForm } from '../islands/AutoForm.tsx';
import { ValidateFormData } from '../services/auto-form.tsx';
import type { EdifyConfig } from '../mod.ts';

export const fields: Field[] = [
	{
		name: 'username',
		type: 'text',
		label: 'Username',
		required: true,
		autoFocus: true,
	},
	{ name: 'password', type: 'password', label: 'Password', required: true },
];

export const handler = {
	async POST(req: Request, ctx: FreshContext<{ edifyConfig: EdifyConfig }>) {
		try {
			const data = await req.json();
			ValidateFormData(data, fields);
			const authCode = await validateAndAuthorize(data.username, data.password);
			const cookie = { name: 'auth', value: authCode, days: 90 };
			return Response.json({
				message: 'Success, redirecting...',
				redirect: ctx.state.edifyConfig.basePath,
				cookies: [cookie],
			});
		} catch (e) {
			console.error(e);
			return Response.json({ error: e.message });
		}
	},
};

export default function LoginPage({ data, state }: FreshContext<{ edifyConfig: EdifyConfig }>) {
	return (
		<Page title='Login' state={state}>
			<div
				className='accent-bg'
				style='padding: 2rem; margin-top: 2rem; border-radius: 1rem;'
			>
				<AutoForm fields={fields} error={data?.error} />
			</div>
		</Page>
	);
}
