//bearbeitet von *** & ***

export default interface StatusResponse {
  statusCode: ResponseStatusCode;
  statusMessage: string;
}

// Relevant status codes taken from this Gist by Soner Çökmen:
// https://gist.github.com/scokmen/f813c904ef79022e84ab2409574d1b45
export enum ResponseStatusCode {
  /**
   * Standard response for successful requests.
   * The actual response will depend on the request method used.
   * In a GET request, the response will contain an entity corresponding to the requested resource.
   * In a POST request, the response will contain an entity describing or containing the result of the action.
   */
  OK = 200,

  /**
   * The request has been fulfilled, resulting in the creation of a new resource.
   */
  CREATED = 201,

  /**
   * The request has been accepted for processing, but the processing has not been completed.
   * The request might or might not be eventually acted upon, and may be disallowed when processing occurs.
   */
  ACCEPTED = 202,

  /**
   * The server successfully processed the request and is not returning any content.
   */
  NO_CONTENT = 204,

  /**
   * Indicates multiple options for the resource from which the client may choose (via agent-driven content negotiation).
   * For example, this code could be used to present multiple video format options,
   * to list files with different filename extensions, or to suggest word-sense disambiguation.
   */
  MULTIPLE_CHOICES = 300,

  /**
   * This and all future requests should be directed to the given URI.
   */
  MOVED_PERMANENTLY = 301,

  /**
   * Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.
   * In such case, there is no need to retransmit the resource since the client still has a previously-downloaded copy.
   */
  NOT_MODIFIED = 304,

  /**
   * The server cannot or will not process the request due to an apparent client error
   * (e.g., malformed request syntax, too large size, invalid request message framing, or deceptive request routing).
   */
  BAD_REQUEST = 400,

  /**
   * Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet
   * been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the
   * requested resource. See Basic access authentication and Digest access authentication. 401 semantically means
   * "unauthenticated",i.e. the user does not have the necessary credentials.
   */
  UNAUTHORIZED = 401,

  /**
   * The request was valid, but the server is refusing action.
   * The user might not have the necessary permissions for a resource.
   */
  FORBIDDEN = 403,

  /**
   * The requested resource could not be found but may be available in the future.
   * Subsequent requests by the client are permissible.
   */
  NOT_FOUND = 404,

  /**
   * A request method is not supported for the requested resource;
   * for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
   */
  METHOD_NOT_ALLOWED = 405,

  /**
   * The server timed out waiting for the request.
   */
  REQUEST_TIMEOUT = 408,

  /**
   * Indicates that the request could not be processed because of conflict in the request,
   * such as an edit conflict between multiple simultaneous updates.
   */
  CONFLICT = 409,

  /**
   * Indicates that the resource requested is no longer available and will not be available again.
   * This should be used when a resource has been intentionally removed and the resource should be purged.
   * Upon receiving a 410 status code, the client should not request the resource in the future.
   * Clients such as search engines should remove the resource from their indices.
   * Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.
   */
  GONE = 410,

  /**
   * The server does not meet one of the preconditions that the requester put on the request.
   */
  PRECONDITION_FAILED = 412,

  /**
   * The request is larger than the server is willing or able to process. Previously called "Request Entity Too Large".
   */
  PAYLOAD_TOO_LARGE = 413,

  /**
   * The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request,
   * in which case it should be converted to a POST request.
   * Called "Request-URI Too Long" previously.
   */
  URI_TOO_LONG = 414,

  /**
   * The request entity has a media type which the server or resource does not support.
   * For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format.
   */
  UNSUPPORTED_MEDIA_TYPE = 415,

  /**
   * The request was well-formed but was unable to be followed due to semantic errors.
   */
  UNPROCESSABLE_ENTITY = 422,

  /**
   * The resource that is being accessed is locked.
   */
  LOCKED = 423,

  /**
   * The request failed due to failure of a previous request (e.g., a PROPPATCH).
   */
  FAILED_DEPENDENCY = 424,

  /**
   * The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.
   */
  TOO_MANY_REQUESTS = 429,

  /**
   * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
   */
  INTERNAL_SERVER_ERROR = 500,

  /**
   * The server either does not recognize the request method, or it lacks the ability to fulfill the request.
   * Usually this implies future availability (e.g., a new feature of a web-service API).
   */
  NOT_IMPLEMENTED = 501,

  /**
   * The server was acting as a gateway or proxy and received an invalid response from the upstream server.
   */
  BAD_GATEWAY = 502,

  /**
   * The server is currently unavailable (because it is overloaded or down for maintenance).
   * Generally, this is a temporary state.
   */
  SERVICE_UNAVAILABLE = 503,

  /**
   * The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
   */
  GATEWAY_TIMEOUT = 504,

  /**
   * The server is unable to store the representation needed to complete the request.
   */
  INSUFFICIENT_STORAGE = 507,

  /**
   * The server detected an infinite loop while processing the request.
   */
  LOOP_DETECTED = 508,
}
