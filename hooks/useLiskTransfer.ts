import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useCache } from "../hooks/useCache";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskTransfer {
	recipient: any;
	recipientLoading: boolean;
	recipientError: string | undefined;
	fetchRecipient: (id: string) => Promise<any>;
	recipientMessage: string | undefined;

	transferLoading: boolean;
	transferMessage: string | undefined;
	transferError: string | undefined;
	makeTransfer: ({
		userId,
		transactionAmount,
		transactionRecipient,
		transactionNotes,
	}: {
		userId: string;
		transactionAmount: number;
		transactionRecipient: string;
		transactionNotes?: string;
	}) => Promise<void>;

	batchTransferLoading: boolean;
	batchTransferMessage: string | undefined;
	batchTransferError: string | undefined;
	makeBatchTransfer: ({
		userId,
		payments,
		transactionNotes,
	}: {
		userId: string;
		payments: { recipient: string; amount: number }[];
		transactionNotes?: string;
	}) => Promise<void>;
}

export function useLiskTransfer({ apiKey }: { apiKey?: string }): iUseLiskTransfer {
	const { getCache, setCache } = useCache();

	const [recipient, setRecipient] = useState<any>(undefined);
	const [recipientLoading, setRecipientLoading] = useState(false);
	const [recipientError, setRecipientError] = useState<string | undefined>(undefined);
	const [recipientMessage, setRecipientMessage] = useState<string | undefined>(undefined);

	const [transferLoading, setTransferLoading] = useState(false);
	const [transferMessage, setTransferMessage] = useState<string | undefined>(undefined);
	const [transferError, setTransferError] = useState<string | undefined>(undefined);

	const [batchTransferLoading, setBatchTransferLoading] = useState(false);
	const [batchTransferError, setBatchTransferError] = useState<string | undefined>(undefined);
	const [batchTransferMessage, setBatchTransferMessage] = useState<string | undefined>(undefined);

	// reset all messages and errors after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setRecipientError(undefined);
			setRecipientMessage(undefined);

			setTransferError(undefined);
			setTransferMessage(undefined);

			setBatchTransferError(undefined);
			setBatchTransferMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		recipientError,
		recipientMessage,
		transferError,
		transferMessage,
		batchTransferError,
		batchTransferMessage,
	]);

	// Fetch recipient details by payment identifier or email
	const fetchRecipient = useCallback(
		async (id: string) => {
			setRecipientLoading(true);
			setRecipientError(undefined);
			setRecipientMessage(undefined);
			setRecipient(undefined);

			const cacheKey = `recipient_${id}`;
			try {
				const cached = getCache(cacheKey);
				if (cached) {
					setRecipient(cached);
					setRecipientLoading(false);
					return cached;
				}

				const { data } = await axios.get(`${API_BASE}/recipient/${id}`, {
					headers: { Authorization: apiKey },
				});
				setRecipient(data);
				setCache(cacheKey, data);
				setRecipientMessage("Fetched recipient successfully.");
				return data;
			} catch (err: any) {
				if (err?.response?.status === 404) {
					setRecipientError("Recipient not found.");
				} else if (err?.response?.status === 400) {
					setRecipientError("Invalid identifier provided.");
				} else if (err?.response?.status === 401) {
					setRecipientError("Unauthorized.");
				} else {
					setRecipientError("Failed to fetch recipient.");
				}
			} finally {
				setRecipientLoading(false);
			}
		},
		[apiKey, getCache, setCache],
	);

	// Single transfer
	const makeTransfer = useCallback(
		async ({
			userId,
			transactionAmount,
			transactionRecipient,
			transactionNotes,
		}: {
			userId: string;
			transactionAmount: number;
			transactionRecipient: string;
			transactionNotes?: string;
		}) => {
			setTransferLoading(true);
			setTransferMessage(undefined);
			setTransferError(undefined);
			try {
				const { data } = await axios.post(
					`${API_BASE}/transfer/${userId}`,
					{
						transactionAmount,
						transactionRecipient,
						transactionNotes,
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setTransferMessage(data.message || "Transfer executed successfully.");
				return data;
			} catch (err: any) {
				if (err?.response?.status === 400) {
					setTransferError("Invalid input or validation error.");
				} else if (err?.response?.status === 401) {
					setTransferError("Unauthorized.");
				} else {
					setTransferError("Failed to execute transfer.");
				}
			} finally {
				setTransferLoading(false);
			}
		},
		[apiKey],
	);

	// Batch transfer
	const makeBatchTransfer = useCallback(
		async ({
			userId,
			payments,
			transactionNotes,
		}: {
			userId: string;
			payments: { recipient: string; amount: number }[];
			transactionNotes?: string;
		}) => {
			setBatchTransferLoading(true);
			setBatchTransferMessage(undefined);
			setBatchTransferError(undefined);
			try {
				const { data } = await axios.post(
					`${API_BASE}/transfer/batch/${userId}`,
					{
						payments,
						transactionNotes,
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setBatchTransferMessage(data.message || "Batch transfer executed successfully.");
				return data;
			} catch (err: any) {
				if (err?.response?.status === 400) {
					setBatchTransferError("Invalid input or validation error.");
				} else if (err?.response?.status === 401) {
					setBatchTransferError("Unauthorized.");
				} else {
					setBatchTransferError("Failed to execute batch transfer.");
				}
			} finally {
				setBatchTransferLoading(false);
			}
		},
		[apiKey],
	);

	return {
		// recipient
		recipient,
		recipientLoading,
		recipientError,
		fetchRecipient,
		recipientMessage,

		// single transfer
		transferLoading,
		transferMessage,
		transferError,
		makeTransfer,

		// batch transfer
		batchTransferLoading,
		batchTransferMessage,
		batchTransferError,
		makeBatchTransfer,
	};
}
