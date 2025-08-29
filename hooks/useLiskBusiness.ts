"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
	iMintStableCoinsResponse,
	iPendingTx,
	iPendingTxResponse,
	iUserTokenBalance,
} from "../types"; // changed from "@/types/"
import { useCache } from "../hooks/useCache";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseBusiness {
	float: iUserTokenBalance[];
	loadingFloat: boolean;
	floatError: string | undefined;
	floatMessage: string | undefined;
	fetchFloat: () => Promise<iUserTokenBalance[]>;

	gasLoading: boolean;
	gasMessage: string | undefined;
	gasError: string | undefined;
	enableBusinessGas: () => Promise<void>;
	enableUserGas: (userId: string) => Promise<void>;

	mintForm: {
		transactionAmount: string;
		transactionRecipient: string;
		transactionNotes: string;
	};
	mintLoading: boolean;
	mintMessage: string | undefined;
	mintError: string | undefined;
	setMintForm: React.Dispatch<
		React.SetStateAction<{
			transactionAmount: string;
			transactionRecipient: string;
			transactionNotes: string;
		}>
	>;
	mintStableCoins: () => Promise<iMintStableCoinsResponse | undefined>;

	pendingTx: iPendingTx[];
	pendingLoading: boolean;
	pendingError: string | undefined;
	pendingMessage: string | undefined;
	fetchPendingTx: () => Promise<iPendingTxResponse>;

	userGasLoading: boolean;
	userGasMessage: string | undefined;
	userGasError: string | undefined;
}

/**
 * Custom React hook for managing Lisk business operations, including:
 * - Fetching float (token) balances
 * - Enabling gas for business and users
 * - Minting stablecoins
 * - Fetching pending transactions
 * - Managing loading, success, and error states for each operation
 * - Caching results to optimize API calls
 *
 * @param apiKey - Optional API key for authentication with backend services.
 * @returns An object containing state variables, loading/error indicators, and functions for:
 *   - float: Array of user token balances
 *   - loadingFloat: Loading state for float balances
 *   - floatError: Error message for float balance fetch
 *   - fetchFloat: Function to fetch float balances
 *   - gasLoading, gasMessage, gasError: States for enabling business gas
 *   - enableBusinessGas: Function to enable business gas
 *   - userGasLoading, userGasMessage, userGasError: States for enabling user gas
 *   - enableUserGas: Function to enable gas for a specific user
 *   - mintForm: Form state for minting stablecoins
 *   - setMintForm: Setter for mintForm
 *   - mintLoading, mintMessage, mintError: States for minting stablecoins
 *   - mintStableCoins: Function to mint stablecoins
 *   - pendingTx: Array of pending transactions
 *   - pendingLoading, pendingError: States for fetching pending transactions
 *   - fetchPendingTx: Function to fetch paginated pending transactions
 *
 * @remarks
 * This hook is intended for use in business-related components that interact with the Lisk stablecoin backend.
 * It handles API communication, caching, and state management for common business operations.
 */
export function useLiskBusiness({ apiKey }: { apiKey?: string }): iUseBusiness {
	const { getCache, setCache } = useCache();

	const [float, setFloat] = useState<iUserTokenBalance[]>([]);
	const [loadingFloat, setLoadingFloat] = useState(false);
	const [floatError, setFloatError] = useState<string | undefined>(undefined);
	const [floatMessage, setFloatMessage] = useState<string | undefined>(undefined);

	const [gasLoading, setGasLoading] = useState(false);
	const [gasMessage, setGasMessage] = useState<string | undefined>(undefined);
	const [gasError, setGasError] = useState<string | undefined>(undefined);

	const [mintForm, setMintForm] = useState({
		transactionAmount: "",
		transactionRecipient: "",
		transactionNotes: "",
	});
	const [mintLoading, setMintLoading] = useState(false);
	const [mintMessage, setMintMessage] = useState<string | undefined>(undefined);
	const [mintError, setMintError] = useState<string | undefined>(undefined);

	const [pendingTx, setPendingTx] = useState<iPendingTx[]>([]);
	const [pendingLoading, setPendingLoading] = useState(false);
	const [pendingError, setPendingError] = useState<string | undefined>(undefined);
	const [pendingMessage, setPendingMessage] = useState<string | undefined>(undefined);

	const [userGasLoading, setUserGasLoading] = useState(false);
	const [userGasMessage, setUserGasMessage] = useState<string | undefined>(undefined);
	const [userGasError, setUserGasError] = useState<string | undefined>(undefined);

	// clear all errors and message after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setUserGasError(undefined);
			setUserGasMessage(undefined);

			setFloatError(undefined);
			setFloatMessage(undefined);

			setGasError(undefined);
			setGasMessage(undefined);

			setMintError(undefined);
			setMintMessage(undefined);

			setPendingError(undefined);
			setPendingMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		userGasError,
		userGasMessage,
		gasError,
		mintError,
		mintMessage,
		pendingError,
		pendingMessage,
	]);

	// Fetch float balances
	const fetchFloat = useCallback(async () => {
		setLoadingFloat(true);
		setFloatError(undefined);
		if (apiKey) return;

		const cacheKey = "float_balances";
		const cached = getCache(cacheKey);
		if (cached) {
			setFloat(cached);
			setLoadingFloat(false);
			return cached;
		}

		try {
			const { data } = await axios.get<{ tokens: iUserTokenBalance[] }>(`${API_BASE}/float`, {
				headers: { Authorization: apiKey },
			});
			setFloat(data.tokens || []);
			setCache(cacheKey, data.tokens || []);
			setFloatMessage("Fetched token balances successfully.");
			return data.tokens || [];
		} catch (err: any) {
			setFloatError("Failed to fetch token balances.");
			console.error("Failed to fetch token balances:", err);
		} finally {
			setLoadingFloat(false);
		}

		return [];
	}, [apiKey, getCache, setCache]);

	// Enable gas
	const enableBusinessGas = useCallback(async () => {
		setGasLoading(true);
		setGasMessage(undefined);
		setGasError(undefined);
		try {
			const { data } = await axios.post(
				`${API_BASE}/enable-gas`,
				{},
				{ headers: { Authorization: apiKey } },
			);
			setGasMessage("Gas allocation successful.");
			return data;
		} catch (err: any) {
			setGasError("Failed to enable gas.");
			console.error("Failed to enable gas:", err);
		} finally {
			setGasLoading(false);
		}
	}, [apiKey]);

	// Enable gas for a user
	const enableUserGas = useCallback(
		async (userId: string) => {
			setUserGasLoading(true);
			setUserGasMessage(undefined);
			setUserGasError(undefined);
			try {
				await axios.post(
					`${API_BASE}/activate-pay/${userId}`,
					{},
					{ headers: { Authorization: apiKey } },
				);
				setUserGasMessage("Gas payment activated successfully for user.");
			} catch (err: any) {
				setUserGasError("Failed to activate gas payment for user.");
				console.error("Failed to activate gas payment for user:", err);
			} finally {
				setUserGasLoading(false);
			}
		},
		[apiKey],
	);

	// Mint stableCoins
	const mintStableCoins = useCallback(async () => {
		setMintLoading(true);
		setMintMessage(undefined);
		setMintError(undefined);
		try {
			const { data } = await axios.post<iMintStableCoinsResponse>(
				`${API_BASE}/mint`,
				{
					transactionAmount: Number(mintForm.transactionAmount),
					transactionRecipient: mintForm.transactionRecipient,
					transactionNotes: mintForm.transactionNotes,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: apiKey,
					},
				},
			);
			setMintMessage(data.message || "Mint operation successful.");
			setMintForm({ transactionAmount: "", transactionRecipient: "", transactionNotes: "" });
			fetchFloat();
			return data;
		} catch (err: any) {
			setMintError("Failed to mint tokens.");
			console.error(err);
		} finally {
			setMintLoading(false);
		}
	}, [
		apiKey,
		fetchFloat,
		mintForm.transactionAmount,
		mintForm.transactionNotes,
		mintForm.transactionRecipient,
	]);

	// Fetch paginated pending transactions
	const fetchPendingTx = useCallback(
		async (page = 1, pageSize = 10) => {
			setPendingLoading(true);
			setPendingError(undefined);
			if (apiKey) return;

			const cacheKey = `pending_tx`;
			const cached = getCache(cacheKey);
			if (cached) {
				setPendingTx(cached);
				setPendingLoading(false);
				return cached;
			}
			try {
				const { data } = await axios.get<iPendingTxResponse>(
					`${API_BASE}/transactions/pending?page=${page}&pageSize=${pageSize}`,
					{
						headers: { Authorization: apiKey },
					},
				);
				setPendingTx(data.transactions);
				setCache(cacheKey, data);
				setPendingMessage("Fetched pending transactions successfully.");
				return data;
			} catch (err: any) {
				setPendingError("Failed to fetch pending transactions.");
				console.error("Failed to fetch pending transactions:", err);
			} finally {
				setPendingLoading(false);
			}

			return [];
		},
		[apiKey, getCache, setCache],
	);

	useEffect(() => {
		fetchFloat();
		fetchPendingTx(1, 10);
	}, [fetchFloat, fetchPendingTx]);

	return {
		float,
		loadingFloat,
		floatError,
		fetchFloat,
		floatMessage,

		gasLoading,
		gasMessage,
		gasError,
		enableBusinessGas,
		userGasLoading,
		userGasMessage,
		userGasError,
		enableUserGas,

		mintForm,
		setMintForm,
		mintLoading,
		mintMessage,
		mintError,
		mintStableCoins,

		pendingTx,
		pendingLoading,
		pendingError,
		fetchPendingTx,
		pendingMessage,
	};
}
