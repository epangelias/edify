import { Handler } from '$fresh/server.ts';
import { Page } from '../components/Page.tsx';
import { Redirect } from '../services/web.ts';

export const handler: Handler = (_req, ctx) => {
	// return new Redirect('/app');
	return ctx.render();
};

export default function Home() {
	return (
		<Page heading='Homepage'>
			<nav>
				<ul>
					<li>
						<a href='/unsorted'>Unsorted</a>
					</li>
				</ul>
			</nav>
		</Page>
	);
}
