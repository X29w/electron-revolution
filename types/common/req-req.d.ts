declare namespace ResReq {
  interface PublicResponse<T = unknown> {
    meta: {
      code: number;
    };
    data: T;
  }
}
