import { GetDataTypes } from './data-types.tsx';
import EntriesTable from '../islands/EntriesTable.tsx';
import Meth from './meth.ts';
import { CreateForm, Field, SetDataToFields, ValidateFormData } from './auto-form.tsx';
import { Redirect } from './web.ts';
import db from './db.ts';

interface EditorLink {
	title: string;
	path: string;
}

interface EditorPage {
	path: string;
	view: 'edit' | 'table' | 'dashboard' | 'redirect';
	dataTypeID?: string;
	links?: EditorLink[];
	redirect?: string;
}

const editors: EditorPage[] = [
	{
		path: '',
		view: 'dashboard',
		links: [
			{ title: 'Software Docs', path: 'docs/software' },
			{ title: 'Help Docs', path: 'docs/help' },
		],
	},
	{
		path: 'docs',
		view: 'redirect',
		redirect: '/edify/edit',
	},
	{
		path: 'docs/software',
		view: 'table',
		dataTypeID: 'doc',
	},
	{
		path: 'docs/software/*',
		view: 'edit',
		dataTypeID: 'doc',
	},
	{
		path: 'docs/help',
		view: 'table',
		dataTypeID: 'doc',
	},
	{
		path: 'docs/help/*',
		view: 'edit',
		dataTypeID: 'doc',
	},
];

function pathMatches(path: string[], path2: string) {
	if (path2 == path.join('/')) return true;
	if (path2 == path.slice(0, -1).join('/') + '/*') return true;
	return false;
}

export default async function Editor(path: string[]) {
	const editor = editors.find((e) => pathMatches(path, e.path));
	if (!editor) throw new Error('Editor page not found');

	let [editorView, fields] = await MakeEditorContent(path, editor);
	const linkView = RenderLinks(editor.links);
	const backLink = path[0] ? <a href={'/edify/edit/' + path.slice(0, -1).join('/')}>Back</a> : '';

	return {
		getContent: async () => {
			[editorView] = await MakeEditorContent(path, editor);
			return [backLink, editorView, linkView];
		},
		getFields: () => fields as Field[],
		setDataAndValidate: (data) => {
			SetDataToFields(fields as Field[], data);
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

async function MakeEditorContent(path: string[], editor: EditorPage) {
	const dataTypes = await GetDataTypes(db);
	const dataType = dataTypes.get(editor.dataTypeID);

	if (editor.view == 'dashboard') return [];
	else if (editor.view == 'redirect') {
		throw new Redirect(editor.redirect || '');
	} else if (editor.view == 'edit') {
		if (!dataType) throw new Error('Data type not found');
		const res = await db.get(path);
		// if (res.versionstamp === null) throw new Error('Data does not exist');
		const data = res.value ?? {};
		const multipleFields = Array.isArray(dataType.fields);
		let fields: Field[] = multipleFields ? dataType.fields : [dataType.fields];
		if (!multipleFields && data !== null) {
			if (fields.length) fields[0].value = Meth.string(data);
		} else SetDataToFields(fields, data);
		fields = [...fields, { type: 'submit', value: 'Save' }];
		return [CreateForm({ fields }), fields];
	} else if (editor.view == 'table') {
		if (!dataType) throw new Error('Data type not found');
		const res = await Array.fromAsync(db.list({ prefix: path }));
		const columns = ['key', ...dataType.fields.map((f) => f.name)];
		const rows = res.map((r, i) => {
			return columns.map((col, j) => {
				if (j == 0) return { value: r.key.at(-1), link: `/edify/edit/${path.join('/')}/${r.key.at(-1)}` };
				return { value: res[i].value[col] };
			});
		});
		return [<EntriesTable columns={columns} rows={rows} />];
	} else throw new Error('Invalid Editor view: ' + editor.view);
}
