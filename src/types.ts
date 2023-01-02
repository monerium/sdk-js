// --- Config --- //

export type Environment = { api: string; web: string };

export type Config = {
  environments: { production: Environment; sandbox: Environment };
};

// --- Client Variables --- //

export interface BearerProfile {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  profile: string;
  userId: string;
}

// --- Client Methods  --- //

export enum Currency {
  eur = "eur",
  usd = "usd",
  gbp = "gbp",
  isk = "isk",
}

// -- auth

export type AuthArgs =
  | Omit<AuthCode, "grant_type">
  | Omit<RefreshToken, "grant_type">
  | Omit<ClientCredentials, "grant_type">;

export interface AuthCode {
  grant_type: "authorization_code";
  client_id: string;
  code: string;
  code_verifier: string;
  redirect_uri: string;
  scope?: string;
}

export interface RefreshToken {
  grant_type: "refresh_token";
  client_id: string;
  refresh_token: string;
  scope?: string;
}

export interface ClientCredentials {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
  scope?: string;
}

// -- pkceRequest

export type PKCERequestArgs = Omit<
  PKCERequest,
  "code_challenge" | "code_challenge_method" | "response_type"
>;

export type PKCERequest = {
  client_id: string;
  code_challenge: string;
  code_challenge_method: string;
  response_type: string;
  state: string;
  redirect_uri?: string;
  scope?: string;
  address?: string;
};

// -- authContext

enum Method {
  password = "password",
  resource = "resource",
  jwt = "jwt",
  apiKey = "apiKey",
}

export enum ProfileType {
  corporate = "corporate",
  personal = "personal",
}

export enum Permission {
  read = "read",
  write = "write",
}

export interface AuthProfile {
  id: string;
  type: ProfileType;
  name: string;
  perms: Permission[];
}

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  roles: "admin"[];
  auth: { method: Method; subject: string; verified: boolean };
  defaultProfile: string;
  profiles: AuthProfile[];
}

// -- getProfile

export enum KYCState {
  absent = "absent",
  submitted = "submitted",
  pending = "pending",
  confirmed = "confirmed",
}

export enum KYCOutcome {
  approved = "approved",
  rejected = "rejected",
  unknown = "unknown",
}

export interface KYC {
  state: KYCState;
  outcome: KYCOutcome;
}

export enum PaymentStandard {
  iban = "iban",
  scan = "scan",
}

export interface Account {
  address: string;
  currency: Currency;
  standard: PaymentStandard;
  iban?: string;
  sortCode?: string;
  accountNumber?: string;
  network: Network;
  chain: Chain;
  id?: string;
}

export interface Profile {
  id: string;
  name: string;
  kyc: KYC;
  accounts: Account[];
}

// -- getBalances

export enum Chain {
  polygon = "polygon",
  ethereum = "ethereum",
  gnosis = "gnosis",
}

export enum Network {
  mainnet = "mainnet",
  chiado = "chiado",
  goerli = "goerli",
  mumbai = "mumbai",
}

export interface Balance {
  currency: Currency;
  amount: string;
}

export interface Balances {
  id: string;
  address: string;
  chain: Chain;
  network: Network;
  balances: Balance[];
}

// --getOrders

export enum OrderKind {
  redeem = "redeem",
  issue = "issue",
}

export enum OrderState {
  placed = "placed",
  pending = "pending",
  processed = "processed",
  rejected = "rejected",
}

export interface Fee {
  provider: "satchel";
  currency: Currency;
  amount: string;
}

export interface IBAN {
  standard: PaymentStandard.iban;
  iban: string;
}

export interface SCAN {
  standard: PaymentStandard.scan;
  sortCode: string;
  accountNumber: string;
}

export interface Individual {
  firstName: string;
  lastName: string;
  country?: string;
}

export interface Corporation {
  companyName: string;
  country: string;
}

export interface Counterpart {
  identifier: IBAN | SCAN;
  details: Individual | Corporation;
}

export interface OrderMetadata {
  approvedAt: string;
  processedAt: string;
  rejectedAt: string;
  state: OrderState;
  placedBy: string;
  placedAt: string;
  receivedAmount: string;
  sentAmount: string;
}

export interface OrderFilter {
  address?: string;
  txHash?: string;
  profile?: string;
  memo?: string;
  accountId?: string;
  state?: OrderState;
}

export interface Order {
  id: string;
  profile: string;
  accountId: string;
  address: string;
  kind: OrderKind;
  amount: string;
  currency: Currency;
  totalFee: string;
  fees: Fee[];
  counterpart: Counterpart;
  memo: string;
  rejectedReason: string;
  supportingDocumentId: string;
  meta: OrderMetadata;
}

// -- getTokens

export interface Token {
  currency: Currency;
  ticker: string;
  symbol: string;
  chain: Chain;
  network: Network;
  address: string;
  decimals: number;
}

// --placeOrder

export interface NewOrder {
  kind: OrderKind;
  amount: string;
  signature: string;
  accountId?: string;
  address: string;
  currency: Currency;
  counterpart: Counterpart;
  message: string;
  memo: string;
  supportingDocumentId?: string;
  chain: Chain;
  network: Network;
}

// -- uploadSupportingDocument

export interface SupportingDocMetadata {
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportingDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  hash: string;
  meta: SupportingDocMetadata;
}

// -- linkAddress

export interface CurrencyAccounts {
  network: Network;
  chain: Chain;
  currency: Currency;
}

export interface LinkAddress {
  address: string;
  message: string;
  signature: string;
  accounts: CurrencyAccounts[];
}