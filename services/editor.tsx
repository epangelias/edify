import { DataType, GetDataTypes } from './data-types.tsx';
import EntriesTable from '../islands/EntriesTable.tsx';
import Meth from './meth.ts';
import { CreateForm, Field, SetDataToFields, ValidateFormData } from './auto-form.tsx';
import { Redirect } from './web.ts';
import db from './db.ts';
import { Cell } from '../islands/Table.tsx';
import { AutoForm } from '../islands/AutoForm.tsx';
import { EdifyConfig } from '../mod.ts';

interface EditorLink {
	title: string;
	path: string;
}

export interface EditorPage {
	path: string;
	view: 'edit' | 'table' | 'dashboard' | 'redirect';
	dataTypeID?: string;
	links?: EditorLink[];
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
	
	const dataType = dataTypes[editor.dataTypeID];

	let [editorView, fields] = await MakeEditorContent(path, editor, dataType);
	const linkView = RenderLinks(editor.links);
	const backLink = path[0] ? <a href={'/edify/edit/' + path.slice(0, -1).join('/')}>Back</a> : '';

	return {
		getContent: async () => {
			[editorView] = await MakeEditorContent(path, editor, dataType);
			return [backLink, editorView, linkView];
		},
		getFields: () => fields as Field[],
		validate: (data: { [key: string]: string }) => {
			ValidateFormData(data, fields as Field[]);
		},
	};
}

function RenderLinks(links?: EditorLink[]) {
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

async function MakeEditorContent(path: string[], editor: EditorPage, dataType) {
	if (editor.view == 'dashboard') return [];
	else if (editor.view == 'redirect') {
		throw new Redirect(editor.redirect || '');
	} else if (editor.view == 'edit') {
		if (!dataType) throw new Error('Data type not found');
		const res = await db.get(path);
		// if (res.versionstamp === null) throw new Error('Data does not exist');
		const multipleFields = Array.isArray(dataType.fields);
		let fields = (multipleFields ? dataType.fields : [dataType.fields]) as Field[];
		fields = structuredClone(fields);
		const data = (res.value ?? {}) as { [key: string]: string };
		if (!multipleFields && data !== null) {
			if (fields.length) fields[0].value = Meth.string(data);
		} else SetDataToFields(fields, data);
		return [<AutoForm fields={fields} />, fields];
	} else if (editor.view == 'table') {
		if (!dataType) throw new Error('Data type not found');
		const res = await Array.fromAsync(db.list({ prefix: path })) as { value: { [key: string]: string }; key: Deno.KvKey }[];
		const multipleFields = Array.isArray(dataType.fields);
		let fields = (multipleFields ? dataType.fields : [dataType.fields]) as Field[];
		const columns = ['key', ...fields.map((f) => f.name)];
		const rows = res.map((r, i) => {
			return columns.map((col, j) => {
				if (j == 0) return { value: r.key.at(-1), link: `/edify/edit/${path.join('/')}/${r.key.at(-1)?.toString()}` };
				if (!col) return { value: '' };
				const value = res[i].value[col];
				return { value };
			});
		});
		return [<EntriesTable path={path} columns={columns as string[]} rows={rows as Cell[][]} />];
	} else throw new Error('Invalid Editor view: ' + editor.view);
}
