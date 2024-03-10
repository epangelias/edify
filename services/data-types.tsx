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
			cols: 80,
			rows: 30,
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
				cols: 80,
				rows: 30,
			},
		],
	},
};
