import {
  urlEncoded,
  placeOrderMessage,
  rfc3339,
  generateRandomString,
} from '../src/utils';
import encodeBase64Url from 'crypto-js/enc-base64url';
import SHA256 from 'crypto-js/sha256';

describe('rfc3339', () => {
  test('should format Date to RFC 3339 format', () => {
    const date = new Date(1682820495 * 1000);
    expect(rfc3339(date)).toEqual('2023-04-30T02:08:15Z');
  });

  test('should handle timezone offset for positive offset', () => {
    const date = new Date('2023-04-30T12:00:00+02:00');
    expect(rfc3339(date)).toEqual('2023-04-30T10:00:00Z');
  });

  test('should handle timezone offset for negative offset', () => {
    const date = new Date('2023-04-30T12:00:00-02:00');
    expect(rfc3339(date)).toEqual('2023-04-30T14:00:00Z');
  });
  test('should throw an error if date is not provided', () => {
    expect(() => rfc3339(new Date('what'))).toThrow('Invalid Date');
  });
});

describe('getMessage', () => {
  test('should format message with valid inputs', () => {
    const message = placeOrderMessage({
      currency: 'usd',
      amount: 100,
      iban: 'DE89370400440532013000',
    });
    expect(message).toMatch(
      /^Send USD 100 to DE89370400440532013000 at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    );
  });
});

describe('url params', () => {
  test('should create a query string from an object', () => {
    const obj = { foo: 'bar', bar: 'foo' };
    const params = new URLSearchParams(obj);
    expect(params.toString()).toEqual(urlEncoded(obj));
  });
  test('should create an empty query string when given an empty object', () => {
    const obj = {};
    const params = new URLSearchParams(obj);
    expect(params.toString()).toEqual(urlEncoded(obj));
  });
  test('handle spaces as plus', () => {
    const obj = { foobar: 'bazqux 4quux' };
    const params = new URLSearchParams(obj);
    expect(params.toString().replace('+', '%20')).toEqual(urlEncoded(obj));
  });
  test('handles special characters in code challenge', () => {
    const codeVerifier = generateRandomString();
    const challenge = encodeBase64Url.stringify(SHA256(codeVerifier as string));

    const obj = {
      client_id: '',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      response_type: 'code',
    };
    const params = new URLSearchParams(obj);
    expect(params.toString()).toEqual(urlEncoded(obj));
  });
});