import { useEffect, useState } from 'preact/hooks';
import Table, { Cell } from './Table.tsx';
import { useSignal } from '@preact/signals';
import { Popup } from './Popup.tsx';
import { Field } from '../services/auto-form.tsx';
import Meth from '../services/meth.ts';
import { EdifyConfig } from '../mod.ts';

export interface Props {
	columns: string[];
	rows: Cell[][];
	path: string[];
	fields: Field[];
	values: Deno.KvEntry<Record<string, unknown>>[];
	state: { edifyConfig: EdifyConfig };
}

export default function EntriesTable({ path, values, fields, state }: Props) {
	const columns = ['Key', ...fields.map((f) => f.name)];

	const Values = useSignal(values);

	const rows: Cell[][] = [];

	const [searchTerm, setSearchTerm] = useState('');
	const Rows = useSignal<Cell[][]>(rows as Cell[][]);

	useEffect(() => {
		Rows.value = Values.value.map((r, i) => {
			const link = `##${r.key.at(-1)?.toString()}`;
			const cols = columns.map((col, j) => {
				if (j == 0) return { value: <a href={link}>{r.key.at(-1) as string}</a> };
				const value = Values.value[i].value[col];
				return { value };
			});
			async function deleteCommand() {
				if (searchTerm) return alert('Cannot delete with active filter');
				if (!confirm(`Are you sure you want to delete ${r.key.at(-1) as string}?`)) return;
				const keyPath = r.key.join('/');
				const res = await fetch(state.edifyConfig.basePath + '/api/delete/' + keyPath);
				console.log(res);
				if (!res.ok) return alert('Error deleting');
				Values.value.splice(i, 1);
				Values.value = [...Values.value];
			}
			cols.push({ value: <a onClick={deleteCommand}>🗑️</a> });
			return cols;
		});
	}, [Values.value]);

	function handleSearchChange(value: string) {
		setSearchTerm(value);
	}

	function filteredRows() {
		return Rows.value.filter((row) => row.some((cell) => cell && cell?.value?.toLowerCase && cell?.value?.toLowerCase().includes(searchTerm.toLowerCase())));
	}

	function newCommand() {
		const ID = prompt('Enter Key. Must be lowercase and use -s for spaces. Must be unique.');
		if (ID) window.location.href = '##' + ID;
	}

	return (
		<div>
			<div className='table-bar'>
				<input
					class='table-search'
					type='search'
					placeholder='Search...'
					value={searchTerm}
					onInput={(e) => handleSearchChange(e.currentTarget.value)}
					autoFocus
				/>
				<button onClick={newCommand}>New</button>
			</div>
			<Table columns={columns} rows={filteredRows()} />
			<Popup path={path} Values={Values} fields={fields} state={state} />
		</div>
	);
}
