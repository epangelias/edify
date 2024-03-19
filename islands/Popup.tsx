import { useEffect, useRef, useState } from 'preact/hooks';
import { AutoForm } from './AutoForm.tsx';
import {Field, SetDataToFields} from "../services/auto-form.tsx";
import { Signal, useSignal } from '@preact/signals';

export function Popup({fields: _fields, Values, path}: {fields: Field[], Values: Signal<Deno.KvEntry<Record<string, unknown>>[]>, path: string[]}) {
	const fields = useSignal(_fields);
	const [action, setAction] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);

	function open(){
		const modal = dialog.current;
		if (!modal) return;
		const ID = document.location.hash.split("##")[1];
		if(!ID)return;
		const value = Values.value.find(val => val.key.at(-1) == ID);
		// if(!value)return alert("Entry does not exist of ID " +ID);
		if(value)SetDataToFields(fields.value, value.value);
		else fields.value.forEach(field => field.value = field.defaultValue || "");
		setAction("/edify/edit/" + path.join("/") + "/" + ID);
		fields.value = [...fields.value];
		modal.showModal();
	}

	useEffect(() => {
		open();
		globalThis.addEventListener('hashchange', () => { open() }, false);
	}, []);

	function dialogClickHandler(e: MouseEvent) {
		if (!(e.target instanceof HTMLDialogElement)) {
			return;
		}

		const rect = e.target.getBoundingClientRect();

		const clickedInDialog = rect.top <= e.clientY &&
			e.clientY <= rect.top + rect.height &&
			rect.left <= e.clientX &&
			e.clientX <= rect.left + rect.width;

		if (clickedInDialog === false) {
			e.target.close();
		}
	}

	function dialogClose(){
		window.history.pushState({}, '', window.location.href.split('#')[0]);
	}

	function onSubmit(data: Record<string, unknown>){
		const ID = document.location.hash.split("##")[1];
		if(!ID)return;
		let res = Values.value.find(val => val.key.at(-1) == ID);
		if(!res){
			res = {
				key: [...path, ID],
				value: data,
				versionstamp: "1",
			}; 
			Values.value.push(res);
		}
		res.value = data;
		Values.value = [...Values.value];
		dialog.current?.close();
	}

	return (
		<dialog ref={dialog} onMouseDown={dialogClickHandler} onClose={dialogClose}>
			<AutoForm fields={fields.value} action={action} onSubmit={onSubmit} />

			<form method='dialog'>
				<button>Close</button>
			</form>
		</dialog>
	);
}
