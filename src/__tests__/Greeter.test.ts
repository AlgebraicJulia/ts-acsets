import { greet } from '../index'

test('My Greeter', () => {
  expect(greet('Carl')).toBe('Hello Carl')
})
