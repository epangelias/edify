import { useEffect, useState } from 'preact/hooks';
import Table, { Cell } from './Table.tsx';
import { useSignal } from '@preact/signals';
import { Popup } from './Popup.tsx';
import { Field } from '../services/auto-form.tsx';

export interface Props {
	columns: string[];
	rows: Cell[][];
	path: string[];
	fields: Field[];
	values: Deno.KvEntry<Record<string, unknown>>[];
}

export default function EntriesTable({ path, values, fields }: Props) {
	const columns = ['Key',...fields.map(f => f.name)];

	const Values = useSignal(values);

	function getRows(){
		return Values.value.map((r, i) => {
			const link = `##${r.key.at(-1)?.toString()}`
			const cols = columns.map((col, j) => {
				if(j == 0)return { value: <a href={link}>{r.key.at(-1)}</a> };
				let value = Values.value[i].value[col];
				if(typeof value == "boolean")value = value ? "✔️" : "❌";
				return { value };
			});
			return cols;
		})
	}

	const rows = getRows();

	const [searchTerm, setSearchTerm] = useState('');
	const Rows = useSignal<Cell[][]>(rows as Cell[][]);


	useEffect(() => {
		Rows.value = getRows() as Cell[][];
	}, [Values.value]);

	function handleSearchChange(value: string) {
		setSearchTerm(value);
	}

	function filteredRows() {
		return Rows.value.filter((row) => row.some((cell) => cell && cell?.value?.toLowerCase && cell?.value?.toLowerCase().includes(searchTerm.toLowerCase())));
	}

	function newCommand() {
		const ID = prompt('Enter ID');
		if (ID) window.location.href = '##' + ID;
	}

	function deleteCommand(rowID: number) {
		if (searchTerm) return alert('Cannot delete with active filter');
		const key = Rows.value[rowID][0].value;
		if (!confirm(`Are you sure you want to delete ${key}?`)) return;
		const keyPath = path.join('/') + '/' + key;
		fetch('/edify/api/delete/' + keyPath);
		const newRows = [...Rows.value];
		newRows.splice(rowID, 1);
		Rows.value = newRows;
	}

	return (
		<div>
			<div className='table-bar accent-bg'>
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
			<Table columns={columns} rows={filteredRows()} deleteCommand={deleteCommand} />
			<Popup path={path} Values={Values} fields={fields} />
		</div>
	);
}
