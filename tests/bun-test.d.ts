declare module "bun:test" {
	type TestFunction = () => void | Promise<void>;

	interface TestApi {
		(name: string, test: TestFunction): void;
		each<Arguments extends readonly unknown[]>(
			cases: readonly Arguments[],
		): (
			name: string,
			test: (...arguments_: Arguments) => void | Promise<void>,
		) => void;
	}

	interface Matchers {
		toBe(expected: unknown): void;
		toBeUndefined(): void;
		toEqual(expected: unknown): void;
		toHaveLength(expected: number): void;
		toMatchObject(expected: object): void;
		toThrow(expected?: unknown): void;
	}

	export function describe(name: string, test: TestFunction): void;
	export function expect(actual: unknown): Matchers;
	export const it: TestApi;
}
