export const makeRequest = (method, params, id) => {
  return JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: id
  });
};

export const createPromiseResult = (resolve, reject) => {
  return (err, result) => {
    if (err) reject(err);
    else resolve(result);
  };
};
