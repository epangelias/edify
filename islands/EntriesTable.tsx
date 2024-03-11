import { useState } from 'preact/hooks';
import Table, { Cell } from './Table.tsx';
import { useSignal } from '@preact/signals';

export interface Props {
	columns: string[];
	rows: Cell[][];
	path: string[];
}

export default function EntriesTable({ rows, columns, path }: Props) {
	const [searchTerm, setSearchTerm] = useState('');
	const Rows = useSignal<Cell[][]>(rows);

	function handleSearchChange(value: string) {
		setSearchTerm(value);
	}

	function filteredRows() {
		return Rows.value.filter((row) => row.some((cell) => cell && cell?.value?.toLowerCase && cell?.value?.toLowerCase().includes(searchTerm.toLowerCase())));
	}

	function newCommand() {
		const ID = prompt('Enter ID');
		if (ID) window.location.href = window.location.href + '/' + ID;
	}

	function deleteCommand(rowID: number) {
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
				/>
				<button onClick={newCommand}>New</button>
			</div>
			<Table columns={columns} rows={filteredRows()} deleteCommand={deleteCommand} />
		</div>
	);
}
