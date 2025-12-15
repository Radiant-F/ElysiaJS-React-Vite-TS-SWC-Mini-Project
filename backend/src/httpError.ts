export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function assert(condition: any, status: number, message: string) {
  if (!condition) {
    throw new HttpError(status, message);
  }
}
