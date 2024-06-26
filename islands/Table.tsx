import { useSignal } from '@preact/signals';
import { useEffect, useState } from 'preact/hooks';
import { JSX } from 'preact/jsx-runtime';
import Meth from '../services/meth.ts';

export interface Cell {
	link: string;
	value: string | JSX.Element;
	text: string;
}

interface SortState {
	key: string;
	direction: boolean;
}

export interface Props {
	columns: string[];
	rows: Cell[][];
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
								{formatName(column)}
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
									{formatValue(cell.value, 50)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function formatName(input: string) {
	const regex = /[A-Z]/g;
	return input.replace(regex, (match) => ` ${match}`);
}

function formatValue(str: unknown, len: number) {
	const date = Meth.stringToDate(str);
	if (date) return <span style={{ color: 'color-mix(in srgb, orange, currentColor)' }}>{date.toDateString()}</span>;
	else if (typeof str == 'object') return str as JSX.Element;
	else if (typeof str == 'string') return str.substring(0, len);
	else if (typeof str == 'number') return <code style={{ color: 'color-mix(in srgb, green, currentColor)', fontSize: '1rem' }}>{str}</code>;
	else if (typeof str == 'boolean') return <span style={{ scale: '1.5', display: 'inline-block' }}>{str ? '◼' : '◻'}</span>;
	return str;
}
