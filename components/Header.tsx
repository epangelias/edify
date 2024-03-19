export function Header() {
	return (
		<header>
			<div className='left'>
				<a href='/'>◂ Back To Website</a>
			</div>
			<div className='right'>
				<a href='/edify/login'>
					Login
				</a>&nbsp;
				<a href='/edify/logout'>
					Logout
				</a>
			</div>
			<hr />
		</header>
	);
}
