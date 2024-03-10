import SiteData from '../data/site-data.tsx';
import { UserData } from '../services/user.tsx';

interface props {
	userData?: UserData;
	route: string;
}

export function Header() {
	return (
		<header>
			<div className='left'>
				<a href='/'>{SiteData.logo}</a>
			</div>
			<div className='right'>
				<a href='/edify/login'>
					Login
				</a>
				<a href='/edify/logout'>
					Logout
				</a>
			</div>
			<hr />
		</header>
	);
}
