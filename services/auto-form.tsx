import Meth from './meth.ts';

export interface Field {
	name?: string;
	type: 'text' | 'number' | 'email' | 'password' | 'submit' | 'textarea' | 'select' | 'checkbox' | 'hidden' | 'date';
	placeholder?: string;
	label?: string;
	value?: string;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	autocomplete?: 'on' | 'off';
	cols?: number;
	rows?: number;
	options?: [string, string][];
	autoFocus?: boolean;
}

async function castFieldValue(value: string, field: Field){
	switch (field.type){
		case 'number':
			return Number(value);
		case 'checkbox':
			return !!value;
		case 'date':
			return new Date(value);
		case 'password': 
			return await Meth.hashPassword(value);
		default:
			return value;
	}
}

export async function ExtractFormData(obj: Record<string, unknown>,  fields: Field[]){
	const data = new Map(Object.entries(obj));
	const result = {};
	for (const field of fields){
		result[field.name] = await castFieldValue(data.get(field.name) as string, field);
	}
	return result;
}

export async function GetFormData(a: Request | FormData, fields?: Field[]) {
	const form = a instanceof FormData ? a : await a.formData();
	const result: { [key: string]: unknown } = {};
	for (const [key, value] of form.entries()) {
		result[key] = value.toString();
	}
	if(fields)return ExtractFormData(result, fields);
	return result;
}

interface validationCondition {
	condition: (args: Field, value: string) => unknown;
	message: (args: Field, value: string) => string;
}

const validationConditions: validationCondition[] = [
	{
		condition: (field, value) => !value && field.type != 'checkbox' && !field.disabled,
		message: (field) => `${field.label || field.name} is required`,
	},
	{
		condition: (field, value) => field.maxLength && value.length > field.maxLength,
		message: (field) => `${field.label || field.name} is too long. Maximum length is ${field.maxLength}`,
	},
	{
		condition: (field, value) => field.minLength && value.length < field.minLength,
		message: (field) => `${field.label || field.name} is too short. Minimum length is ${field.minLength}`,
	},
	{
		condition: (field, value) => field.type === 'number' && isNaN(Number(value)),
		message: (field) => `${field.label || field.name} is not a number`,
	},
	{
		condition: (field, value) =>
			field.type === 'number' &&
			field.min !== undefined &&
			Number(value) < field.min,
		message: (field) => `${field.label || field.name} must be at least ${field.min}`,
	},
	{
		condition: (field, value) =>
			field.type === 'number' &&
			field.max !== undefined &&
			Number(value) > field.max,
		message: (field) => `${field.label || field.name} must be at most ${field.max}`,
	},
	{
		condition: (field, value) =>
			field.type === 'number' &&
			field.step !== undefined &&
			Number(value) % field.step !== 0,
		message: (field) => `${field.label || field.name} must be a multiple of ${field.step}`,
	},
	{
		condition: (field, value) =>
			field.type === 'email' &&
			!value.includes('@'),
		message: (field) => `${field.label || field.name} is not a valid email`,
	},
];

type FormDataType = { [key: string]: string };

export class FieldError extends Error {
	errors: string[];
	constructor(errors: string[]) {
		super(errors.join(', '));
		this.name = 'FieldError';
		this.errors = errors;
	}
}

export function ValidateFormData(data: FormDataType, fields: Field[]) {
	const errors = [];
	for (const field of fields) {
		for (const condition of validationConditions) {
			if (typeof field.name !== 'string') continue;
			const value = data[field.name];
			if (!field.required && value == '') continue;
			if (condition.condition(field, value)) errors.push(condition.message(field, value));
		}
	}

	if (errors.length) {
		throw new FieldError(errors);
	}
}

export async function GetFormDataAndValidate(req: Request, fields: Field[]) {
	const data = await GetFormData(req, fields);
	ValidateFormData(data, fields);
	return data;
}

export function SetDataToFields(fields: Field[], data: { [key: string]: string }) {
	fields.forEach((field) => field.value = data[field.name] || '');
}

export function ObjectToFields(obj: Record<string, object>): Field[] {
	const fields: Field[] = [];
	for (const key in obj) {
		if (Meth.objHas(obj, key)) {
			const val = obj[key];
			const typeMap: Record<string, string> = { string: 'text', number: 'number', boolean: 'checkbox' };
			const type = typeMap[typeof val];
			if (!type) continue;
			fields.push({ name: key, type, value: val + '', label: key } as Field);
		}
	}
	return fields;
}

export function DataTypeToFieldType(
	type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function',
) {
	return {
		string: 'text',
		boolean: 'checkbox',
		number: 'number',
		object: 'textarea',
		undefined: 'text',
		bigint: 'number',
		function: 'undefined',
		symbol: 'undefined',
	}[type];
}
