export interface iUser {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	imageUrl: string | null;
	enabledPay: boolean | null;
	role: string;
	publicKey: string | null;
	paymentIdentifier: string | null;
	businessId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface iUserTokenBalance {
	name: string;
	balance: number;
}

export interface iTransaction {
	id: string;
	userId: string;
	externalId?: string | null;
	txType: string;
	method: string;
	currency: string;
	value: number;
	status: string;
	createdAt: string;
}

export interface iApiToken {
	id: string;
	description: string | null;
	revoked: boolean;
	createdAt: string;
	revokedAt: string | null;
}

export interface iApiTokenCreateResponse {
	id: string;
	token: string;
}

export interface iApiTokenRevokeResponse {
	message: string;
}

export interface iCharge {
	id: string;
	paymentId: string;
	amount: number;
	note?: string | null;
	status: "PENDING" | "COMPLETE";
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface iBankAccount {
	id: string;
	userId: string;
	accountHolder: string;
	accountNumber: string;
	branchCode: string;
	bank: string;
	createdAt: string;
	updatedAt: string;
}

export interface iDepositWithdrawalTransaction {
	id: string;
	userid: string;
	transactionType: string;
	transactionMethod: string;
	transactionCurrency: string;
	transactionAmount: number;
	transactionNetwork?: string;
	transactionAddress?: string;
	createdAt: string;
	updatedAt: string;
}

export interface iBankAccountResponse {
	message?: string;
	bankAccount?: iBankAccount;
}

export interface iCoupon {
	id: string;
	userId: string;
	title: string;
	imageUrl: string | null;
	description: string;
	code: string;
	ref: string;
	validUntil: string;
	maxCoupons: number;
	availableCoupons: number;
	createdAt: string;
	updatedAt: string;
}

export interface iCouponCreateRequest {
	title: string;
	imageUrl: string | null;
	description: string;
	code: string;
	ref: string;
	validUntil: string;
	maxCoupons: number;
	availableCoupons: number;
}

export type iCouponUpdateRequest = iCouponCreateRequest;

export interface iCouponClaimRequest {
	couponId: string;
}

export interface iCouponResponse {
	message?: string;
	coupon?: iCoupon;
}

export interface iStaffMember {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
}

export interface iStaffAssignRequest {
	input: string;
}

export interface iStaffAssignResponse {
	success: boolean;
}

export interface iStaffRemoveResponse {
	success: boolean;
}

// transaction types
export interface iCreateTransactionResponse {
	message: string;
	transaction: iTransaction;
}

export interface iCreateTransactionParams {
	userId: string;
	transactionType: string;
	transactionMethod: string;
	transactionCurrency: string;
	transactionAmount: number;
	transactionNetwork?: string;
	transactionAddress?: string;
}

export interface iUpsertBankAccountParams {
	userId: string;
	accountHolder: string;
	accountNumber: string;
	branchCode: string;
	bankName: string;
}

// business types
export interface iMintStableCoinsResponse {
	message: string;
	transaction: Record<string, unknown>;
	receipt: Record<string, unknown>;
}

export interface iPendingTx {
	id: "string";
	userId: "string";
	txType: "string";
	method: "string";
	creditCurrency: "string";
	creditValue: 1;
	status: "string";
	createdAt: "2025-08-22T18:06:25.305Z";
	updatedAt: "2025-08-22T18:06:25.305Z";
	details: Record<string, unknown>;
	user: {
		id: "string";
		firstName: "string";
		lastName: "string";
		email: "hello@example.com";
		publicKey: null;
		paymentIdentifier: "string";
		role: "string";
	};
}

export interface iPendingTxResponse {
	transactions: iPendingTx[];
	total: 1;
	page: 1;
	pageSize: 1;
	totalPages: 1;
}
