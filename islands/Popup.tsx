import { useEffect, useRef, useState } from 'preact/hooks';

export function Popup() {
	const [content, setContent] = useState('');

	const dialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const modal = dialog.current;
		if (!modal) return;
		globalThis.addEventListener('hashchange', () => {
			const [popup, path] = location.hash.split(':');
			if (popup !== '#edit') return;
			window.history.pushState({}, '', window.location.href.split('#')[0]);
			loadEdit(path);
		}, false);
	}, []);

	async function loadEdit(path: string) {
		const modal = dialog.current;
		if (!modal) return;
		setContent('/edify/edit/' + path);
		modal.showModal();
	}

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

	return (
		<dialog ref={dialog} onClick={dialogClickHandler}>
			<iframe src={content}></iframe>
			<form method='dialog'>
				<button>Close</button>
			</form>
		</dialog>
	);
}
