type TypeName = 'string' | 'boolean' | 'number' | 'object' | 'undefined' | 'bigint' | 'function' | 'symbol';

const Meth = {
	daysToSeconds: (days: number) => days * 24 * 60 * 60,
	randomRange: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
	generateCode(length: number) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let code = '';
		for (let i = 0; i < length; i++) {
			code += characters.charAt(Meth.randomRange(0, characters.length - 1));
		}
		return code;
	},
	cast(type: TypeName, value: unknown) {
		const castValue = {
			string: (a: unknown) => a + '',
			boolean: (a: unknown) => !!a,
			number: (a: unknown) => Number(a),
			object: (a: unknown) => typeof a === 'string' ? JSON.parse(a) : a,
			undefined: () => undefined,
			bigint: (a: unknown) => BigInt(Number(a)),
			function: (a: unknown) => a,
			symbol: (a: unknown) => a,
		};
		return castValue[type](value);
	},
	string(x: unknown) {
		return typeof x == 'object' ? JSON.stringify(x, null, 2) : x + '';
	},
	arrayEquals(a: Array<unknown>, b: Array<unknown>) {
		return a.length === b.length && a.every((value, index) => value === b[index]);
	},
	objHas(obj: unknown, v: PropertyKey) {
		return Object.prototype.hasOwnProperty.call(obj, v);
	},
	objectToMap(obj: Record<string, unknown>): Map<string, unknown> {
		const map = new Map<string, unknown>();
		for (const key in obj) {
			if (Meth.objHas(obj, key)) {
				map.set(key, obj[key]);
			}
		}
		return map;
	},
	formatDate(date: Date) {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	},
	async hashPassword(password: string) {
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
		return hashHex;
	}
};
export default Meth;
