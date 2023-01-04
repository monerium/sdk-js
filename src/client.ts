import { MONERIUM_CONFIG } from "./config";
import encodeBase64Url from "crypto-js/enc-base64url";
import SHA256 from "crypto-js/sha256";
import wordArray from "crypto-js/lib-typedarrays";
import type {
  AuthArgs,
  AuthCode,
  AuthContext,
  Balances,
  BearerProfile,
  ClientCredentials,
  Environment,
  LinkAddress,
  NewOrder,
  Order,
  OrderFilter,
  PKCERequest,
  PKCERequestArgs,
  Profile,
  RefreshToken,
  SupportingDoc,
  Token,
} from "./types";
// import pjson from "../package.json";

export class MoneriumClient {
  #env: Environment;
  #authPayload?: string;

  codeVerifier?: string;
  bearerProfile?: BearerProfile;

  constructor(env: "production" | "sandbox" = "sandbox") {
    this.#env = MONERIUM_CONFIG.environments[env];
  }

  // -- Authentication

  async auth(args: AuthArgs) {
    let params: AuthCode | RefreshToken | ClientCredentials;

    if (this.#isAuthCode(args)) {
      params = { ...args, grant_type: "authorization_code" };
    } else if (this.#isRefreshToken(args)) {
      params = { ...args, grant_type: "refresh_token" };
    } else if (this.#isClientCredentials(args)) {
      params = { ...args, grant_type: "client_credentials" };
    } else {
      throw new Error("Authentication method could not be detected.");
    }

    this.bearerProfile = (await this.#api(
      "post",
      `auth/token`,
      new URLSearchParams(params as unknown as Record<string, string>),
      true
    )) as BearerProfile;

    this.#authPayload = `Bearer ${this.bearerProfile.access_token}`;
  }

  pkceRequest(args: PKCERequestArgs): string {
    // this.codeVerifier = CryptoJS.lib.WordArray.random(64).toString();
    // const challenge = CryptoJS.enc.Base64url.stringify(
    //   CryptoJS.SHA256(this.codeVerifier)
    // );
    this.codeVerifier = wordArray.random(64).toString();
    const challenge = encodeBase64Url.stringify(SHA256(this.codeVerifier));

    const params: PKCERequest = {
      ...args,
      code_challenge: challenge,
      code_challenge_method: "S256",
      response_type: "code",
    };

    return `${this.#env.api}/auth?${new URLSearchParams(params)}`;
  }

  // -- Read Methods

  getAuthContext(): Promise<AuthContext> {
    return this.#api("get", `auth/context`) as Promise<AuthContext>;
  }

  getProfile(profileId: string): Promise<Profile> {
    return this.#api("get", `profiles/${profileId}`) as Promise<Profile>;
  }

  getBalances(profileId?: string): Promise<Balances> | Promise<Balances[]> {
    if (profileId) {
      return this.#api(
        "get",
        `profiles/${profileId}/balances`
      ) as Promise<Balances>;
    } else {
      return this.#api("get", `balances`) as Promise<Balances[]>;
    }
  }

  getOrders(filter?: OrderFilter): Promise<Order[]> {
    const searchParams = new URLSearchParams(
      filter as unknown as Record<string, string>
    );

    return this.#api("get", `orders?${searchParams}`) as Promise<Order[]>;
  }

  getOrder(orderId: string): Promise<Order> {
    return this.#api("get", `orders/${orderId}`) as Promise<Order>;
  }

  getTokens(): Promise<Token[]> {
    return this.#api("get", "tokens") as Promise<Token[]>;
  }

  // -- Write Methods

  linkAddress(profileId: string, body: LinkAddress) {
    return this.#api(
      "post",
      `profiles/${profileId}/addresses`,
      JSON.stringify(body)
    );
  }

  placeOrder(order: NewOrder, profileId?: string): Promise<Order> {
    if (profileId) {
      return this.#api(
        "post",
        `profiles/${profileId}/orders`,
        JSON.stringify(order)
      ) as Promise<Order>;
    } else {
      return this.#api(
        "post",
        `orders`,
        JSON.stringify(order)
      ) as Promise<Order>;
    }
  }

  uploadSupportingDocument(document: File): Promise<SupportingDoc> {
    const searchParams = new URLSearchParams(
      document as unknown as Record<string, string>
    );

    return this.#api(
      "post",
      "files/supporting-document",
      searchParams,
      true
    ) as Promise<SupportingDoc>;
  }

  // -- Helper Methods

  async #api(
    method: string,
    resource: string,
    body?: BodyInit,
    isFormEncoded?: boolean
  ) {
    const res = await fetch(`${this.#env.api}/${resource}`, {
      method,
      headers: {
        "Content-Type": `application/${
          isFormEncoded ? "x-www-form-urlencoded" : "json"
        }`,
        Authorization: this.#authPayload || "",
        // "User-Agent": "sdk/" + pjson.version,
      },
      body,
    });

    const response = await res.json();

    if (res.ok) {
      return response;
    } else {
      throw response;
    }
  }

  #isAuthCode(args: AuthArgs): args is AuthCode {
    return (args as AuthCode).code != undefined;
  }

  #isRefreshToken(args: AuthArgs): args is RefreshToken {
    return (args as RefreshToken).refresh_token != undefined;
  }

  #isClientCredentials(args: AuthArgs): args is ClientCredentials {
    return (args as ClientCredentials).client_secret != undefined;
  }
}