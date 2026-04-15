import { SuccessResponseProps } from "../types/index";

/**
 * A helper function to send a standardized success response.
 * @param {object} options - The options for the success response.
 * @param {Response} options.res - The Express response object.
 * @param {number} options.statusCode - The HTTP status code.
 * @param {string} options.message - The success message.
 * @param {unknown} [options.data] - Optional. The payload to be sent in the response.
 * @param {boolean} [options.success=true] - Optional. The success flag, defaults to true.
 * @param {number} [options.totalCount] - Optional. The total count for paginated list responses.
 * @returns {Response} The Express response object.
 **/

interface ExpressResponse {
  status(code: number): this;
  send(body: any): this;
}

export const sendSuccessResponse = ({
  res,
  data,
  statusCode,
  message,
  success = true,
  totalCount,
}: {
  res: ExpressResponse;
  data?: unknown;
  statusCode: number;
  message: string;
  success?: boolean;
  totalCount?: number;
}): ExpressResponse => {
  const responseBody: SuccessResponseProps = { success, message, totalCount };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).send(responseBody);
};
