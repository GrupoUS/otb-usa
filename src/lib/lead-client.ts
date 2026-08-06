export interface SubmissionGate {
	tryStart(): boolean;
	finish(): void;
	isPending(): boolean;
}

export function createSubmissionGate(): SubmissionGate {
	let pending = false;
	return {
		tryStart() {
			if (pending) return false;
			pending = true;
			return true;
		},
		finish() {
			pending = false;
		},
		isPending() {
			return pending;
		},
	};
}
