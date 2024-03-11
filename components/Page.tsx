import { ComponentChildren } from 'preact';
import { Header } from './Header.tsx';
import { Popup } from '../islands/Popup.tsx';

interface Props {
	title?: string;
	children: ComponentChildren;
	heading?: string;
	noHeading?: boolean;
	plain?: boolean;
}

export function Page({ title, heading, children, noHeading, plain, ...props }: Props) {
	heading = heading ?? title;
	return (
		<html lang='en'>
			<head>
				<meta charset='utf-8' />
				<meta name='viewport' content='width=device-width,height=device-height,initial-scale=1,viewport-fit=cover' />
				<title>{title ? `${title} | Edify` : 'Edify'}</title>
				<link rel='stylesheet' href='/css/editor.css' />
			</head>
			<body>
				<Popup />
				{!plain && <Header />}
				<main {...props}>
					{!noHeading && heading && <h1>{heading}</h1>}
					{children}
				</main>
			</body>
		</html>
	);
}
