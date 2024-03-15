import { useEffect, useRef, useState } from 'preact/hooks';
import { AutoForm } from './AutoForm.tsx';
import {Field, SetDataToFields} from "../services/auto-form.tsx";
import { useSignal } from '@preact/signals';

export function Popup({fields: _fields, values}: {fields: Field[], values: Deno.KvEntry<Record<string, unknown>>[]}) {
	const fields = useSignal(_fields);
	const [action, setAction] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);

	function open(){
		const modal = dialog.current;
		if (!modal) return;
		const ID = document.location.hash.split("##")[1];
		if(!ID)return;
		const value = values.find(val => val.key.at(-1) == ID);
		if(!value)return alert("Entry does not exist of ID " +ID);
		SetDataToFields(fields.value, value.value);
		setAction("/edify/edit/" + value.key.join("/"));
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

	return (
		<dialog ref={dialog} onClick={dialogClickHandler} onClose={dialogClose}>
			<AutoForm fields={fields.value} action={action} />

			<form method='dialog'>
				<button>Close</button>
			</form>
		</dialog>
	);
}
