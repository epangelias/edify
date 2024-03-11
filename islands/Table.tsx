import { useSignal } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';

export interface Cell {
	value: string;
	link: string;
}

interface SortState {
	key: string;
	direction: boolean;
}

export interface Props {
	columns: string[];
	rows: Cell[][];
	deleteCommand: Function;
}

export default function EntriesTable(props: Props) {
	const [sortConfig, setSortConfig] = useState<SortState>({ key: props.columns[0], direction: true });

	function sort(key: string, direction: boolean) {
		props.rows.sort((a, b) => {
			const order = direction ? 1 : -1;
			const cellKey = props.columns.indexOf(key);
			return a[cellKey].value > b[cellKey].value ? order : -order;
		});
	}

	useEffect(() => sort(sortConfig.key, sortConfig.direction), [sortConfig]);

	function handleSortChange(key: string) {
		const direction = sortConfig.key === key && !sortConfig.direction;
		setSortConfig({ key, direction });
		sort(key, direction);
	}

	return (
		<div className='table-container'>
			<table>
				<thead>
					<tr>
						{props.columns.map((column) => (
							<th
								scope='col'
								key={column}
								onClick={() => handleSortChange(column)}
								tabIndex={0}
							>
								{column}
								{sortConfig.key === column && <span class='sort-icon'>{sortConfig.direction ? ' ▾' : ' ▴'}</span>}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{props.rows.map((row, rowID) => (
						<tr>
							{row.map((cell, id) => (
								<td scope='col' key={id}>
									{cell.link ? <a href={cell.link}>{cell.value}</a> : maxLen(cell.value, 100)}
								</td>
							))}
							{props.deleteCommand && <td tabIndex={0} onClick={() => props.deleteCommand(rowID)}>🗑️</td>}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function maxLen(str: unknown, len: number) {
	if (typeof str !== 'string') return null;
	return str.substring(0, len);
}
