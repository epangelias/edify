import { Redirect } from './services/web.ts';
import AppView, { handler as appHandler } from './routes/edit.tsx';
import LoginPage, { handler as loginHandler } from './routes/login.tsx';
import { FreshContext, Plugin } from '$fresh/server.ts';
import db from './services/db.ts';
import type { DataType } from './services/data-types.tsx';
import type { EditorPage } from './services/editor.tsx';
import { getUserByAuth } from './services/user.tsx';
import { GetCookies } from './services/web.ts';

interface edifyConfig {
	dataTypes: DataType[];
	editorPages: EditorPage[];
	basePath: string;
}

export default function edifyPlugin(edifyConfig: edifyConfig): Plugin {
	const basePath = '/edify';

	return {
		name: 'edify',
		islands: {
			baseLocation: import.meta.url,
			paths: ['./islands/Table.tsx', './islands/EntriesTable.tsx', './islands/AutoForm.tsx'],
		},
		routes: [
			{
				path: `${basePath}`,
				handler: () => new Redirect(`${basePath}/edit`),
			},
			{
				path: `${basePath}/edit/[...path]`,
				handler: appHandler,
				component: AppView,
			},
			{
				path: `${basePath}/login`,
				handler: loginHandler,
				component: LoginPage,
			},
			{
				path: `${basePath}/logout`,
				handler: (req: Request) => new Redirect('/edify').setCookie(req, { name: 'auth', value: '', maxAge: 0 }),
			},
			{
				path: `${basePath}/api/delete/[...path]`,
				handler: async (_req: Request, ctx: FreshContext) => {
					await db.delete(ctx.params.path.split('/'));
					return new Response('Success');
				},
			},
		],
		middlewares: [
			{
				path: `${basePath}`,
				middleware: {
					handler: async (req: Request, ctx: FreshContext) => {
						ctx.state.userData = await getUserByAuth(GetCookies(req.headers).auth);
						ctx.state.path = ctx.params?.path?.split('/');
						ctx.state.edifyConfig = edifyConfig;
						return ctx.next();
					},
				},
			},
		],
	};
}
