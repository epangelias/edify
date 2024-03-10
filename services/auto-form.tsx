export interface Field {
	name?: string;
	type: 'text' | 'number' | 'email' | 'password' | 'submit' | 'textarea' | 'select' | 'checkbox' | 'hidden';
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

function createLabel(field: Field) {
	const { name, label } = field;
	return <label htmlFor={'field-' + name}>{label}</label>;
}

function createSelect(field: Field) {
	return (
		<select
			name={field.name}
			id={'field-' + field.name}
			value={field.value}
			required={field.required}
			autoComplete={field.autocomplete || 'off'}
			disabled={field.disabled}
		>
			{field.options?.map((option) => <option value={option[0]}>{option[1]}</option>)}
		</select>
	);
}

function createTextarea(field: Field) {
	return (
		<textarea
			name={field.name}
			id={'field-' + field.name}
			placeholder={field.placeholder}
			value={field.value}
			required={field.required}
			maxLength={field.maxLength}
			minLength={field.minLength}
			autoComplete={field.autocomplete || 'off'}
			disabled={field.disabled}
			cols={field.cols}
			rows={field.rows}
			autoFocus={field.autoFocus}
		>
		</textarea>
	);
}

function createInput(field: Field) {
	if (field.type == 'textarea') return createTextarea(field);
	else if (field.type == 'select') return createSelect(field);
	else if (field.type == 'submit' && !field.value) field.value = 'Submit';
	return (
		<input
			type={field.type}
			name={field.name}
			id={'field-' + field.name}
			placeholder={field.placeholder}
			value={field.value}
			required={field.required}
			maxLength={field.maxLength}
			minLength={field.minLength}
			min={field.min}
			max={field.max}
			step={field.step}
			autoComplete={field.autocomplete || 'off'}
			disabled={field.disabled}
			checked={field.type == 'checkbox' ? !!field.value : undefined}
			autoFocus={field.autoFocus}
		/>
	);
}

function createField(field: Field) {
	return (
		<div className="field-container">
			{field.label && field.type != 'hidden' && createLabel(field)}
			{createInput(field)}
		</div>
	);
}

interface formProps {
	fields: Field[];
	action?: string;
	method?: 'POST' | 'GET';
	error?: string;
	message?: string;
}

export function CreateForm({ fields, action, method = 'POST', error, message }: formProps) {
	return (
		<>
			<form action={action} method={method}>{fields.map(createField)}</form>
			{error && <p class='error'>{error}</p>}
			{message && <p class='updated'>{message}</p>}
		</>
	);
}

export async function GetFormData(req: Request, fields?: Field[]) {
	const form = await req.formData();

	const result: { [key: string]: string } = {};

	if (fields) {
		fields.forEach((field) => field.name && field.value && (result[field.name] = field.value));
	}

	for (const [key, value] of form.entries()) {
		result[key] = value.toString();
	}
	return result;
}

interface validationCondition {
	condition: (args: Field, value: string) => unknown;
	message: (args: Field, value: string) => string;
}

const validationConditions: validationCondition[] = [
	{
		condition: (field, value) => !value && field.type != 'checkbox',
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
			!value.match(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/),
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
	fields.forEach((field) => data && field.name && data[field.name] && (field.value = data[field.name]));
}

export function ObjectToFields(obj: Object) {
	const fields: Field[] = [];
	for (const key in obj) {
		const val = obj.hasOwnProperty(key) && obj[key];
		const typeMap = { string: 'text', number: 'number', boolean: 'checkbox' };
		const type = typeMap[typeof val];
		if (!type) continue;
		fields.push({ name: key, type, value: val + '', label: key });
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
