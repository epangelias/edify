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
	objectToMap(obj: Record<string, unknown>): Map<string, unknown> {
		const map = new Map<string, unknown>();
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				map.set(key, obj[key]);
			}
		}
		return map;
	},
};
export default Meth;
