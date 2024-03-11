import { Redirect } from './services/web.ts';
import AppView, { handler as appHandler } from './routes/edit.tsx';
import LoginPage, { handler as loginHandler } from './routes/login.tsx';
import middlewareHandler from './routes/middleware.tsx';
import { Plugin } from '$fresh/server.ts';
import db from './services/db.ts';

export default function edifyPlugin(): Plugin {
	const basePath = '/edify';

	return {
		name: 'edify',
		islands: {
			baseLocation: import.meta.url,
			paths: ['./islands/Table.tsx', './islands/EntriesTable.tsx', './islands/AutoForm.tsx', './islands/Popup.tsx'],
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
				handler: async (_req, ctx) => {
					await db.delete(ctx.params.path.split('/'));
					return new Response('Success');
				},
			},
		],
		middlewares: [
			{
				path: `${basePath}`,
				middleware: { handler: middlewareHandler },
			},
		],
	};
}