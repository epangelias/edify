import { Redirect } from './services/web.ts';
import AppView, { handler as appHandler } from './routes/edit.tsx';
import LoginPage, { handler as loginHandler } from './routes/login.tsx';
import { FreshContext, Plugin } from '$fresh/server.ts';
import db from './services/db.ts';
import type { EditorPage } from './services/editor.tsx';
import { getUserByAuth } from './services/user.tsx';
import { GetCookies } from './services/web.ts';
import { Field } from './services/auto-form.tsx';

export interface AppState {
	userData: null | { id: string; username: string };
	path: string[];
	edifyConfig: EdifyConfig;
}

export interface DataType {
	name: string;
	fields: Field[];
	ID?: string;
}

export interface EdifyConfig {
	dataTypes: Record<string, DataType>;
	editorPages: EditorPage[];
	basePath: string;
}

export interface EdifyConfigInput {
	dataTypes: Record<string, DataType>;
	editorPages: EditorPage[];
	basePath?: string;
}

export default function edifyPlugin(edifyConfig: EdifyConfigInput): Plugin {
	edifyConfig = {
		basePath: '/edify',
		...edifyConfig,
	};

	return {
		name: 'edify',
		islands: {
			baseLocation: import.meta.url,
			paths: ['./islands/Table.tsx', './islands/EntriesTable.tsx', './islands/AutoForm.tsx', './islands/Popup.tsx'],
		},
		routes: [
			{
				path: `${edifyConfig.basePath}`,
				handler: () => new Redirect(`${edifyConfig.basePath}/edit`),
			},
			{
				path: `${edifyConfig.basePath}/edit/[...path]`,
				handler: appHandler,
				component: AppView,
			},
			{
				path: `${edifyConfig.basePath}/login`,
				handler: loginHandler,
				component: LoginPage,
			},
			{
				path: `${edifyConfig.basePath}/logout`,
				handler: (req: Request) => new Redirect(edifyConfig.basePath as string).setCookie(req, { name: 'auth', value: '', maxAge: 0 }),
			},
			{
				path: `${edifyConfig.basePath}/api/delete/[...path]`,
				handler: async (_req: Request, ctx: FreshContext) => {
					await db.delete(ctx.params.path.split('/'));
					return new Response('Success');
				},
			},
		],
		middlewares: [
			{
				path: `${edifyConfig.basePath}`,
				middleware: {
					handler: async (req: Request, ctx: FreshContext) => {
						ctx.state.userData = await getUserByAuth(GetCookies(req.headers).auth);
						ctx.state.path = ctx.params?.path?.split('/');
						console.log("paht", ctx.state.path);
						ctx.state.edifyConfig = edifyConfig;
						return ctx.next();
					},
				},
			},
		],
	};
}
