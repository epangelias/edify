import { CreateForm, Field, FieldError } from '../services/auto-form.tsx';
import Meth from '../services/meth.ts';
import { FreshContext } from '$fresh/server.ts';
import { validateAndAuthorize } from '../services/user.tsx';
import { Page } from '../components/Page.tsx';
import { Redirect } from '../services/web.ts';
import { GetFormDataAndValidate } from '../services/auto-form.tsx';

export const fields: Field[] = [
	{
		name: 'username',
		type: 'text',
		label: 'Username',
		required: true,
		autoFocus: true,
	},
	{ name: 'password', type: 'password', label: 'Password', required: true },
	{ type: 'submit', value: 'Login' },
];

export const handler = {
	async POST(req: Request, ctx: FreshContext) {
		try {
			const data = await GetFormDataAndValidate(req, fields);
			const authCode = await validateAndAuthorize(data.username, data.password);
			const cookie = {
				name: 'auth',
				value: authCode,
				maxAge: Meth.daysToSeconds(90),
			};
			return new Redirect('/edify').setCookie(req, cookie);
		} catch (e) {
			console.error(e);
			return ctx.render({ error: e.message });
		}
	},
};

export default function LoginPage({ data }: { data: { error?: string } }) {
	return (
		<Page title='Login'>
			<div
				className='accent-bg'
				style='padding: 2rem; margin-top: 2rem; border-radius: 1rem;'
			>
				<CreateForm fields={fields} error={data?.error} />
			</div>
		</Page>
	);
}
