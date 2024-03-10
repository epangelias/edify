import { useState } from 'preact/hooks';
import Table, { Cell } from './Table.tsx';
import { useSignal } from '@preact/signals';

export interface Props {
	columns: string[];
	rows: Cell[][];
}

export default function EntriesTable({ rows, columns }: Props) {
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
			<Table columns={columns} rows={filteredRows()} />
		</div>
	);
}
