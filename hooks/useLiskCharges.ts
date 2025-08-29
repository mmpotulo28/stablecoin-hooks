import { useCallback, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useCache } from "../hooks/useCache";
import { useLiskTransfer } from "./useLiskTransfer";
import { iCharge } from "../types";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskCharges {
	charges: iCharge[];
	chargesLoading: boolean;
	chargesError: string | undefined;
	chargesMessage: string | undefined;
	fetchCharges: (userId: string) => Promise<iCharge[] | void>;

	// get charges
	charge: iCharge | undefined;
	getCharge: (chargeId: string) => Promise<iCharge | void>;
	getChargeLoading: boolean;
	getChargeError: string | undefined;
	getChargeMessage: string | undefined;

	// delete charge
	deleteCharge: ({
		userId,
		chargeId,
	}: {
		userId: string;
		chargeId: string;
	}) => Promise<{ message: string } | void>;
	deleteChargeLoading: boolean;
	deleteChargeError: string | undefined;
	deleteChargeMessage: string | undefined;

	// create charge
	createCharge: (data: {
		userId: string;
		paymentId: string;
		amount: number;
		note?: string;
	}) => Promise<iCharge | void>;
	createChargeLoading: boolean;
	createChargeError: string | undefined;
	createChargeMessage: string | undefined;

	// update charge
	updateCharge: (data: {
		userId: string;
		chargeId: string;
		note?: string;
		status?: "PENDING" | "COMPLETE";
	}) => Promise<iCharge | void>;
	updateChargeLoading: boolean;
	updateChargeError: string | undefined;
	updateChargeMessage: string | undefined;

	// complete charge
	completeCharge: ({
		userId,
		chargeId,
		afterComplete,
	}: {
		userId: string;
		chargeId: string;
		afterComplete: () => void;
	}) => Promise<{
		updateRes: AxiosResponse<any, any>;
		transferRes: AxiosResponse<any, any>;
		message?: string;
	} | void>;
	completeChargeLoading: boolean;
	completeChargeError: string | undefined;
	completeChargeMessage: string | undefined;
}

/**
 * Custom React hook for managing Lisk charges for a user.
 *
 * Provides functions to create, fetch, update, delete, and complete charges,
 * as well as state for loading, errors, and charge data.
 *
 * @param apiKey - Optional API key for authorization.
 * @param user - The user object for whom charges are managed.
 * @returns An object containing:
 * - `charges`: Array of charges for the user.
 * - `chargesLoading`: Loading state for charge operations.
 * - `chargesError`: Error message for charge operations.
 * - `fetchCharges`: Function to fetch all charges for a user.
 * - `charge`: The currently selected charge.
 * - `getCharge`: Function to fetch a specific charge by ID.
 * - `createCharge`: Function to create a new charge.
 * - `updateCharge`: Function to update an existing charge.
 * - `deleteCharge`: Function to delete a charge.
 * - `completeCharge`: Function to complete a charge (transfer and update status).
 * - `completeChargeError`: Error message for completing a charge.
 * - `completeChargeMessage`: Success message for completing a charge.
 * - `completeChargeLoading`: Loading state for completing a charge.
 */
export function useLiskCharges({ apiKey, user }: { apiKey?: string; user: any }): iUseLiskCharges {
	const { getCache, setCache } = useCache();
	const { makeTransfer, transferError } = useLiskTransfer({ apiKey });

	const [charges, setCharges] = useState<iCharge[]>([]);
	const [chargesLoading, setChargesLoading] = useState(false);
	const [chargesError, setChargesError] = useState<string | undefined>(undefined);
	const [chargesMessage, setChargesMessage] = useState<string | undefined>(undefined);

	// get charge
	const [charge, setCharge] = useState<iCharge | undefined>(undefined);
	const [getChargeLoading, setGetChargeLoading] = useState(false);
	const [getChargeError, setGetChargeError] = useState<string | undefined>(undefined);
	const [getChargeMessage, setGetChargeMessage] = useState<string | undefined>(undefined);

	// create charge
	const [createChargeLoading, setCreateChargeLoading] = useState(false);
	const [createChargeError, setCreateChargeError] = useState<string | undefined>(undefined);
	const [createChargeMessage, setCreateChargeMessage] = useState<string | undefined>(undefined);

	// update charge
	const [updateChargeLoading, setUpdateChargeLoading] = useState(false);
	const [updateChargeError, setUpdateChargeError] = useState<string | undefined>(undefined);
	const [updateChargeMessage, setUpdateChargeMessage] = useState<string | undefined>(undefined);

	// delete charge
	const [deleteChargeLoading, setDeleteChargeLoading] = useState(false);
	const [deleteChargeError, setDeleteChargeError] = useState<string | undefined>(undefined);
	const [deleteChargeMessage, setDeleteChargeMessage] = useState<string | undefined>(undefined);

	// complete charge
	const [completeChargeLoading, setCompleteChargeLoading] = useState(false);
	const [completeChargeError, setCompleteChargeError] = useState<string | undefined>(undefined);
	const [completeChargeMessage, setCompleteChargeMessage] = useState<string | undefined>(
		undefined,
	);

	// reset all messages and errors after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setChargesError(undefined);
			setChargesMessage(undefined);

			setGetChargeError(undefined);
			setGetChargeMessage(undefined);

			setCreateChargeError(undefined);
			setCreateChargeMessage(undefined);

			setUpdateChargeError(undefined);
			setUpdateChargeMessage(undefined);

			setDeleteChargeError(undefined);
			setDeleteChargeMessage(undefined);

			setCompleteChargeError(undefined);
			setCompleteChargeMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		chargesError,
		chargesMessage,

		getChargeError,
		getChargeMessage,

		createChargeError,
		createChargeMessage,

		updateChargeError,
		updateChargeMessage,

		deleteChargeError,
		deleteChargeMessage,

		completeChargeError,
		completeChargeMessage,
	]);

	// Create a new charge
	const createCharge = async ({
		userId,
		paymentId,
		amount,
		note,
	}: {
		userId: string;
		paymentId: string;
		amount: number;
		note?: string;
	}) => {
		setCreateChargeLoading(true);
		setCreateChargeError(undefined);
		setCreateChargeMessage(undefined);

		try {
			const { data } = await axios.post<iCharge>(
				`${API_BASE}/charge/${userId}/create`,
				{ paymentId, amount, note },
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: apiKey,
					},
				},
			);
			setCharge(data);
			setCreateChargeMessage("Created charge successfully.");
			return data;
		} catch (err: any) {
			if (err?.response?.status === 400) setCreateChargeError("Validation error.");
			else if (err?.response?.status === 401) setCreateChargeError("Unauthorized.");
			else setCreateChargeError("Failed to create charge.");
		} finally {
			setCreateChargeLoading(false);
		}

		return undefined;
	};

	// Get all charges for a user
	const fetchCharges = useCallback(
		async (userId: string) => {
			setChargesLoading(true);
			setChargesError(undefined);
			const cacheKey = `user_charges_${userId}`;
			try {
				const cached = getCache(cacheKey);
				if (cached) {
					setCharges(cached);
					setChargesLoading(false);
					return cached;
				}

				console.log("fetching charges", apiKey);
				const { data } = await axios.get<{ charges: iCharge[] }>(
					`${API_BASE}/charge/${userId}`,
					{ headers: { Authorization: apiKey } },
				);
				setCharges(data.charges || []);
				setCache(cacheKey, data.charges || []);
				setChargesMessage("Fetched charges successfully.");
				return data.charges || [];
			} catch (err: any) {
				if (err?.response?.status === 400) setChargesError("Invalid parameter.");
				else if (err?.response?.status === 401) setChargesError("Unauthorized.");
				else setChargesError("Failed to fetch charges.");
			} finally {
				setChargesLoading(false);
			}
		},
		[apiKey, getCache, setCache],
	);

	// Get a specific charge by chargeId
	const getCharge = useCallback(
		async (chargeId: string) => {
			setGetChargeLoading(true);
			setGetChargeError(undefined);
			setCharge(undefined);
			try {
				const { data } = await axios.get<{ charge: iCharge }>(
					`${API_BASE}/retrieve-charge/${chargeId}`,
					{
						headers: { Authorization: apiKey },
					},
				);

				console.log("Charge data:", data.charge);
				setCharge(data.charge);
				setGetChargeMessage("Fetched charge successfully.");
				return data.charge;
			} catch (err: any) {
				if (err?.response?.status === 400) setGetChargeError("Invalid parameters.");
				else if (err?.response?.status === 401) setGetChargeError("Unauthorized.");
				else if (err?.response?.status === 404) setGetChargeError("Charge not found.");
				else setGetChargeError("Failed to fetch charge.");
			} finally {
				setChargesLoading(false);
			}

			return undefined;
		},
		[apiKey],
	);

	// Update a charge (note or status)
	const updateCharge = useCallback(
		async ({
			userId,
			chargeId,
			note,
			status,
		}: {
			userId: string;
			chargeId: string;
			note?: string;
			status?: "PENDING" | "COMPLETE";
		}) => {
			setUpdateChargeLoading(true);
			setUpdateChargeError(undefined);
			try {
				const { data } = await axios.put<iCharge>(
					`${API_BASE}/charge/${userId}/${chargeId}/update`,
					{ note, status },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setCharge(data);
				setUpdateChargeMessage("Updated charge successfully.");
				return data;
			} catch (err: any) {
				if (err?.response?.status === 400) setUpdateChargeError("Validation error.");
				else if (err?.response?.status === 401) setUpdateChargeError("Unauthorized.");
				else if (err?.response?.status === 404) setUpdateChargeError("Charge not found.");
				else setUpdateChargeError("Failed to update charge.");
			} finally {
				setUpdateChargeLoading(false);
			}

			return undefined;
		},
		[apiKey],
	);

	// Delete a charge
	const deleteCharge = useCallback(
		async ({ userId, chargeId }: { userId: string; chargeId: string }) => {
			setDeleteChargeLoading(true);
			setDeleteChargeError(undefined);
			try {
				const { data } = await axios.delete<{ message: string }>(
					`${API_BASE}/charge/${userId}/${chargeId}/delete`,
					{ headers: { Authorization: apiKey } },
				);
				setDeleteChargeMessage("Deleted charge successfully.");
				return data;
			} catch (err: any) {
				if (err?.response?.status === 400) setChargesError("Invalid parameters.");
				else if (err?.response?.status === 401) setChargesError("Unauthorized.");
				else setDeleteChargeError("Failed to delete charge.");
			} finally {
				setDeleteChargeLoading(false);
			}
		},
		[apiKey],
	);

	// complete a charge
	const completeCharge = useCallback(
		async ({
			userId,
			chargeId,
			afterComplete,
		}: {
			userId: string;
			chargeId: string;
			afterComplete: () => void;
		}) => {
			setCompleteChargeLoading(true);
			setCompleteChargeError(undefined);
			try {
				// request the charge first
				await getCharge(chargeId);
				if (!charge) throw new Error("Charge not found");

				// 1. Do the transfer using the correct endpoint
				console.log("Transferring charge", charge, userId);
				await makeTransfer({
					userId,
					transactionAmount: charge.amount || 0,
					transactionNotes: charge.note || "",
					transactionRecipient: charge.paymentId || "",
				});

				console.log("Transfer response:", transferError);

				if (transferError) {
					throw new Error(transferError || "Transfer failed");
				}

				// 2. Update the charge status to complete
				console.log("Updating charge status to COMPLETE", charge.id);
				const updateRes = await axios.request({
					method: "PUT",
					url: `https://seal-app-qp9cc.ondigitalocean.app/api/v1/charge/${encodeURIComponent(user?.id || "")}/${encodeURIComponent(charge.id)}/update`,
					headers: {
						"Content-Type": "application/json",
						Authorization: apiKey,
					},
					data: { status: "COMPLETE" },
				});

				// 3. Perform any additional actions after completing the charge
				console.log("now performing function after complete", updateRes.data);
				afterComplete?.();

				setCompleteChargeMessage("Payment successful!");
			} catch (err: any) {
				if (err?.response?.status === 400) setCompleteChargeError("Invalid parameters.");
				else if (err?.response?.status === 401) setCompleteChargeError("Unauthorized.");
				else setCompleteChargeError("Failed to complete charge.");
				console.error("Failed to complete charge:", err);
			} finally {
				setCompleteChargeLoading(false);
			}
		},
		[apiKey, charge, getCharge, makeTransfer, transferError, user?.id],
	);

	return {
		charges,
		chargesLoading,
		chargesError,
		fetchCharges,
		chargesMessage,

		// get charge
		charge,
		getCharge,
		getChargeLoading,
		getChargeError,
		getChargeMessage,

		// create charge
		createCharge,
		createChargeLoading,
		createChargeError,
		createChargeMessage,

		// update charge
		updateCharge,
		updateChargeLoading,
		updateChargeError,
		updateChargeMessage,

		// delete charge
		deleteCharge,
		deleteChargeLoading,
		deleteChargeError,
		deleteChargeMessage,

		// complete charge
		completeCharge,
		completeChargeError,
		completeChargeMessage,
		completeChargeLoading,
	};
}
