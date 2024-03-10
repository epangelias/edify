import db from './db.ts';
import Meth from './meth.ts';

if (!Deno.env.has('EDIFY_USERNAME')) throw new Error('EDIFY_USERNAME not set');
if (!Deno.env.has('EDIFY_PASSWORD')) throw new Error('EDIFY_PASSWORD not set');

const username = Deno.env.get('EDIFY_USERNAME') as string;
const password = Deno.env.get('EDIFY_PASSWORD');

db.set(['users', username], { username, password, isAdmin: true });

export interface UserData {
	username: string;
	password: string;
	isAdmin: boolean;
}

export async function authorizeUser(username: string) {
	const code = Meth.generateCode(16);
	await db.set(['usernameByAuth', code], { username });
	return code;
}

export async function getUsernameByAuth(auth: string) {
	if (!auth) return null;
	const res: Deno.KvEntryMaybe<{ username: string }> = await db.get(['usernameByAuth', auth]);
	if (!res?.versionstamp) return null;
	return res.value.username;
}

export async function getUserByUsername(username: string): Promise<UserData | null> {
	const res: Deno.KvEntryMaybe<UserData> = await db.get(['users', username]);
	if (!res?.versionstamp) return null;
	return res.value;
}

export async function getUserByAuth(auth: string) {
	const username = await getUsernameByAuth(auth);
	if (!username) return null;
	return await getUserByUsername(username);
}

export async function validateAndAuthorize(username: string, password: string) {
	const userData = await getUserByUsername(username);
	if (!userData || userData.password != password) {
		throw new Error('Invalid username or password');
	}
	return await authorizeUser(username);
}
