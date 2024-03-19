import EntriesTable from '../islands/EntriesTable.tsx';
import Meth from './meth.ts';
import { Field, SetDataToFields  } from './auto-form.tsx';
import { Redirect } from './web.ts';
import db from './db.ts';
import { EdifyConfig } from '../mod.ts';
import { JSX } from 'preact/jsx-runtime';

export interface EditorPage {
	path: string;
	view: 'edit' | 'table' | 'dashboard' | 'redirect';
	dataTypeID?: string;
	links?: {title: string, path: string};
	redirect?: string;
}

function pathMatches(path: string[], path2: string) {
	if (path2 == path.join('/')) return true;
	if (path2 == path.slice(0, -1).join('/') + '/*') return true;
	return false;
}

export default async function Editor(path: string[], {editorPages, dataTypes}: EdifyConfig) {
	const editor = editorPages.find((e) => pathMatches(path, e.path));
	if (!editor) throw new Error('Editor page not found');
	
	const dataType = editor.dataTypeID && Meth.objHas(dataTypes, editor.dataTypeID) && dataTypes[editor.dataTypeID];
	let content: JSX.Element|null = null;
	let fields: Field[] = [];

	if (editor.view == 'dashboard'){}
	else if (editor.view == 'redirect') {
		throw new Redirect(editor.redirect || '');
	} else if (editor.view == 'edit') {
		if (!dataType) throw new Error('Data type not found');
		const res = await db.get(path) || {};
		const data = res.value ?? {};
		fields = structuredClone(dataType.fields);
		SetDataToFields(fields, data as Record<string, string>);
	} else if (editor.view == 'table') {
		if (!dataType) throw new Error('Data type not found');
		const res = await Array.fromAsync(db.list({ prefix: path }));
		content = <EntriesTable path={path} values={res} fields={dataType.fields} />;
	} else throw new Error('Invalid Editor view: ' + editor.view);

	const linkView = RenderLinks(editor.links);
	const backLink = path[0] ? <a href={'/edify/edit/' + path.slice(0, -1).join('/')}>◂ Back</a> : '';

	return { content: [backLink, content, linkView], fields };
}

function RenderLinks(links?: {title: string, path: string}[]) {
	if (!links || !links.length) return;
	return (
		<ul class='editor-links'>
			{links.map((link) => (
				<li>
					<a href={'/edify/edit/' + link.path}>{link.title}</a>
				</li>
			))}
		</ul>
	);
}