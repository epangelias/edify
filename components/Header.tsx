export function Header() {
	return (
		<header>
			<div className='left'>
				<a href='/'>Edify</a>
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
