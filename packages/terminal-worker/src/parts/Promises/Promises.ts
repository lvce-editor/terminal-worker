interface WithResolvers<T> {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
}

export const withResolvers = <T>(): WithResolvers<T> => {
  let _resolve: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    _resolve = resolve
  })
  return {
    promise,
    resolve: _resolve!,
  }
}
