import { AppState } from '../mod.ts';

export function Header({ state: { userData, edifyConfig } }: { state: AppState }) {
	return (
		<header>
			<div className='left'>
				<a href='/'>◂ Back To Website</a>
			</div>
			<div className='right'>
				{userData && <a href={edifyConfig.basePath + '/logout'}>Logout</a>}
			</div>
			<hr />
		</header>
	);
}
