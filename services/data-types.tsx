import { Field } from './auto-form.tsx';
import Meth from './meth.ts';

export interface DataType {
	name: string;
	fields: Field | Field[];
	ID?: string;
}

export async function GetDataTypes(db: Deno.Kv) {
	return Meth.objectToMap(DefaultDataTypes) as Map<string, DataType>;
}

const defaultData = JSON.stringify({ name: 'New Data Type', fields: [{ name: 'name', type: 'text', label: 'Name', required: true }] }, null, 2);

const DefaultDataTypes: { [key: string]: DataType } = {
	type: {
		name: 'Data Type',
		fields: {
			name: 'data',
			type: 'textarea',
			cols: 60,
			rows: 10,
			value: defaultData,
		},
	},
	doc: {
		name: 'Doc',
		fields: [
			{
				label: 'Title',
				name: 'title',
				type: 'text',
				required: true,
			},
			{
				label: 'On Menu',
				name: 'onMenu',
				type: 'checkbox',
			},
			{
				label: 'Menu Sort Index',
				name: 'sortIndex',
				type: 'number',
			},
			{
				label: 'Content',
				name: 'content',
				type: 'textarea',
				required: true,
				rows: 10,
			},
		],
	},
	submission: {
		name: 'Form Submission',
		fields: [
			{
				label: 'Date',
				name: 'date',
				type: 'date',
				required: true,
			},
			{
				label: 'Name',
				name: 'name',
				type: 'text',
			},
			{
				label: 'Email',
				name: 'email',
				type: 'email',
			},
			{
				label: 'Message',
				name: 'message',
				type: 'textarea',
				required: true,
			},
		],
	},
};
