import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
	iBankAccount,
	iBankAccountResponse,
	iCreateTransactionParams,
	iCreateTransactionResponse,
	iUpsertBankAccountParams,
} from "../types"; // changed from "@/types"
import { useCache } from "../hooks/useCache";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskBank {
	bankAccount: iBankAccount | undefined;
	bankLoading: boolean;
	bankError: string | undefined;
	bankMessage: string | undefined;
	upsertBankAccount: (data: {
		userId: string;
		accountHolder: string;
		accountNumber: string;
		branchCode: string;
		bankName: string;
	}) => Promise<iBankAccountResponse | undefined>;
	getBankAccount: (userId: string) => Promise<iBankAccount | undefined>;
	deleteBankAccount: (userId: string) => Promise<{ message: string } | undefined>;

	createTransaction: (
		data: iCreateTransactionParams,
	) => Promise<iCreateTransactionResponse | undefined>;

	// Withdrawal
	withdraw: (amount: string) => Promise<iCreateTransactionResponse | void>;
	withdrawLoading: boolean;
	withdrawError: string | null;
	withdrawMessage: string | null;

	// Deposit
	depositLoading: boolean;
	depositError: string | null;
	depositMessage: string | null;
	deposit: (amount: string) => Promise<iCreateTransactionResponse | void>;
}

/**
 * React hook for managing Lisk bank account operations and transactions.
 *
 * Provides functionality to:
 * - Create or update a user's bank account (`upsertBankAccount`)
 * - Fetch a user's bank account (`getBankAccount`)
 * - Delete a user's bank account (`deleteBankAccount`)
 * - Create a transaction (deposit or withdrawal) (`createTransaction`)
 * - Submit withdrawal requests (`withdraw`)
 * - Submit deposit requests (`deposit`)
 *
 * Handles loading, error, and success states for each operation.
 * Utilizes caching for bank account retrieval.
 *
 * @param apiKey - Optional API key for authentication.
 * @param user - The current user object.
 * @returns An object containing:
 * - `bankAccount`: The user's bank account information.
 * - `bankLoading`: Loading state for bank account operations.
 * - `bankError`: Error message for bank account operations.
 * - `bankMessage`: Success message for bank account operations.
 * - `upsertBankAccount`: Function to create or update a bank account.
 * - `getBankAccount`: Function to fetch a bank account.
 * - `deleteBankAccount`: Function to delete a bank account.
 * - `createTransaction`: Function to create a transaction.
 * - `withdraw`: Function to submit a withdrawal request.
 * - `withdrawError`: Error message for withdrawal operations.
 * - `withdrawLoading`: Loading state for withdrawal operations.
 * - `withdrawMessage`: Success message for withdrawal operations.
 * - `deposit`: Function to submit a deposit request.
 * - `depositError`: Error message for deposit operations.
 * - `depositLoading`: Loading state for deposit operations.
 * - `depositMessage`: Success message for deposit operations.
 */
export function useLiskBank({ apiKey, user }: { apiKey?: string; user: any }): iUseLiskBank {
	const { getCache, setCache } = useCache();

	// bank account state
	const [bankAccount, setBankAccount] = useState<iBankAccount | undefined>(undefined);
	const [bankLoading, setBankLoading] = useState(false);
	const [bankError, setBankError] = useState<string | undefined>(undefined);
	const [bankMessage, setBankMessage] = useState<string | undefined>(undefined);

	// Withdrawal state
	const [withdrawLoading, setWithdrawLoading] = useState(false);
	const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
	const [withdrawError, setWithdrawError] = useState<string | null>(null);

	// Deposit state
	const [depositLoading, setDepositLoading] = useState(false);
	const [depositMessage, setDepositMessage] = useState<string | null>(null);
	const [depositError, setDepositError] = useState<string | null>(null);

	// clear all messages after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setBankError(undefined);
			setBankMessage(undefined);

			setWithdrawError(null);
			setWithdrawMessage(null);

			setDepositError(null);
			setDepositMessage(null);
		}, 3000);

		return () => clearTimeout(timer);
	}, [bankError, bankMessage, withdrawError, withdrawMessage, depositError, depositMessage]);

	const upsertBankAccount = useCallback(
		async ({
			userId,
			accountHolder,
			accountNumber,
			branchCode,
			bankName,
		}: iUpsertBankAccountParams) => {
			setBankLoading(true);
			setBankError(undefined);
			try {
				if (!apiKey) throw new Error("API key is missing");
				const { data } = await axios.post<iBankAccountResponse>(
					`${API_BASE}/bank/${encodeURIComponent(userId)}`,
					{ accountHolder, accountNumber, branchCode, bankName },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setBankAccount(data.bankAccount ?? undefined);
				setBankMessage("Bank account created successfully");
				return data;
			} catch (err: any) {
				setBankError(err?.response?.data?.message || "Failed to upsert bank account");
			} finally {
				setBankLoading(false);
			}

			return undefined;
		},
		[apiKey],
	);

	const getBankAccount = useCallback(
		async (userId: string) => {
			setBankLoading(true);
			setBankError(undefined);
			const cacheKey = `bank_account_${userId}`;
			try {
				const cached = getCache(cacheKey);
				if (cached) {
					setBankAccount(cached);
					setBankLoading(false);
					return;
				}

				const { data } = await axios.get<iBankAccount>(
					`${API_BASE}/bank/${encodeURIComponent(userId)}`,
					{
						headers: {
							Authorization: apiKey,
						},
					},
				);
				setBankAccount(data);
				setCache(cacheKey, data);
				return data;
			} catch (err: any) {
				setBankError(
					err?.response?.data?.message ||
						(err?.response?.status === 404
							? "Bank account not found"
							: "Failed to fetch bank account"),
				);
			} finally {
				setBankLoading(false);
			}
		},
		[apiKey, getCache, setCache],
	);

	const deleteBankAccount = useCallback(
		async (userId: string): Promise<{ message: string } | undefined> => {
			setBankLoading(true);
			setBankError(undefined);
			try {
				const { data } = await axios.delete<{ message: string }>(
					`${API_BASE}/bank/${encodeURIComponent(userId)}`,
					{
						headers: {
							Authorization: apiKey,
						},
					},
				);
				setBankAccount(undefined);
				setBankMessage("Bank account deleted successfully");
				return data;
			} catch (err: any) {
				setBankError(
					err?.response?.data?.message ||
						(err?.response?.status === 404
							? "Bank account not found"
							: "Failed to delete bank account"),
				);
			} finally {
				setBankLoading(false);
			}
		},
		[apiKey],
	);

	const createTransaction = useCallback(
		async ({
			userId,
			transactionType,
			transactionMethod,
			transactionCurrency,
			transactionAmount,
			transactionNetwork,
			transactionAddress,
		}: iCreateTransactionParams): Promise<iCreateTransactionResponse | undefined> => {
			setBankLoading(true);
			setBankError(undefined);
			try {
				const { data } = await axios.post<iCreateTransactionResponse>(
					`${API_BASE}/create-transaction/${encodeURIComponent(userId)}`,
					{
						transactionType,
						transactionMethod,
						transactionCurrency,
						transactionAmount,
						transactionNetwork,
						transactionAddress,
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setBankMessage("Transaction created successfully");
				return data;
			} catch (err: any) {
				setBankError(err?.response?.data?.message || "Failed to create transaction");
			} finally {
				setBankLoading(false);
			}
		},
		[apiKey],
	);

	// Withdrawal
	const withdraw = useCallback(
		async (amount: string) => {
			setWithdrawLoading(true);
			setWithdrawError(null);

			if (!bankAccount || !user) {
				setWithdrawError("Bank account or user not found");
				setWithdrawLoading(false);
				return;
			}

			try {
				const data = await createTransaction({
					userId: user?.id || "",
					transactionType: "withdraw",
					transactionMethod: "bank",
					transactionCurrency: "ZAR",
					transactionAmount: Number(amount),
					transactionNetwork: "lisk",
					transactionAddress: bankAccount?.id,
				});
				setWithdrawMessage("Withdrawal request submitted successfully!");
				return data;
			} catch (err: any) {
				setWithdrawError(err?.response?.data?.message || "Failed to submit withdrawal.");
			} finally {
				setWithdrawLoading(false);
			}
		},
		[bankAccount, createTransaction, user],
	);

	// deposit
	const deposit = useCallback(
		async (amount: string) => {
			setDepositLoading(true);
			setDepositError(null);

			if (!bankAccount || !user) {
				setDepositError("Bank account or user not found");
				setDepositLoading(false);
				return;
			}

			try {
				const data = await createTransaction({
					userId: user?.id || "",
					transactionType: "deposit",
					transactionMethod: "bank",
					transactionCurrency: "ZAR",
					transactionAmount: Number(amount),
					transactionNetwork: "lisk",
					transactionAddress: bankAccount.id,
				});
				setDepositMessage("Deposit request submitted successfully!");
				return data;
			} catch (err: any) {
				setDepositError(err?.response?.data?.message || "Failed to submit deposit.");
			} finally {
				setDepositLoading(false);
			}
		},
		[bankAccount, createTransaction, user],
	);

	return {
		// bank account
		bankAccount,
		bankLoading,
		bankError,
		bankMessage,
		upsertBankAccount,
		getBankAccount,
		deleteBankAccount,
		createTransaction,

		// withdrawal
		withdraw,
		withdrawError,
		withdrawLoading,
		withdrawMessage,
		// deposit
		deposit,
		depositError,
		depositLoading,
		depositMessage,
	};
}
