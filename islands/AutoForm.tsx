import { useRef, useState } from 'preact/hooks';
import { Field } from '../services/auto-form.tsx';
import { useSignal } from '@preact/signals';

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
	// Set textarea height to its content
	function setHeight(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		// alert(target.offsetHeight + ', ' + target.scrollHeight);
		if (target.offsetHeight > target.scrollHeight) return;
		target.style.height = 'auto';
		target.style.height = target.scrollHeight + 16 + 'px';
	}

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
			onFocus={setHeight}
			onInput={setHeight}
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

export function createField(field: Field) {
	return (
		<div className='field-container'>
			{field.label && field.type != 'hidden' && createLabel(field)}
			{createInput(field)}
		</div>
	);
}

export function GetFormData(formData: FormData) {
	const result: { [key: string]: string } = {};

	for (const [key, value] of formData.entries()) {
		result[key] = value.toString();
	}

	return result;
}

interface CookieOptions {
	name: string;
	value: string;
	days: number;
}

function setCookie({ name, value, days }: CookieOptions) {
	const secureFlag = window.location.protocol === 'https:' ? 'Secure; ' : '';
	const domain = `Domain=${window.location.hostname}; `;
	const sameSite = 'SameSite=Lax; ';
	days = days === undefined ? Number.MAX_SAFE_INTEGER : days;
	const date = new Date();
	date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	const expires = `expires=${date.toUTCString()}; `;

	document.cookie = `${name}=${value || ''}; ${expires}${secureFlag}${domain}${sameSite}path=/`;
}

interface formProps {
	fields: Field[];
	action?: string;
}

export function AutoForm({ fields, action }: formProps) {
	const msg = useSignal('');
	const err = useSignal('');
	const btn = useRef<HTMLButtonElement>(null);
	const form = useRef<HTMLFormElement>(null);

	async function submit(e: Event) {
		e.preventDefault();
		if (btn.current) btn.current.disabled = true;
		err.value = '';
		msg.value = '';

		try {
			if (!form.current) throw new Error('Form not found');

			const formData = new FormData(form.current);

			const res = await fetch(action || '', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(GetFormData(formData)),
			});

			if (!res.ok) {
				throw new Error(`Request failed with status ${res.status}`);
			}

			const result = await res.json();

			if (result.error) throw new Error(result.error);

			if (result.cookies && Array.isArray(result.cookies)) {
				result.cookies.forEach((cookie: CookieOptions) => setCookie(cookie));
			}

			if (result.redirect) window.location.href = result.redirect;

			msg.value = result.message || 'Submitted';
		} catch (e) {
			console.error('Error submitting form:', e);
			err.value = e.message;
		}

		if (btn.current) btn.current.disabled = false;
	}

	return (
		<>
			<form onSubmit={submit} ref={form}>
				{fields.map(createField)}
				<button ref={btn}>Submit</button>
			</form>
			{err && <p class='form-error'>{err}</p>}
			{msg && <p class='form-message'>{msg}</p>}
		</>
	);
}
