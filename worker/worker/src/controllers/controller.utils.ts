import { Response } from '@loopback/rest';

export interface errorObject {
  reason: string;
  message: string;
};


export function respondWithError(res: Response, error: any): void {
  // just rethrow when some unrecognized error format
  if (!error.statusCode) throw error;

  res.status(error.statusCode).send( { errorObject: createErrorObject(error) });
}

export function createErrorObject(error: any): errorObject {
  const reason = error.reason ?? null;
  const message = error.message ?? null;

  return { reason, message };
}
