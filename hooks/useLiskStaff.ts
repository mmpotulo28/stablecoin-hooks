import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { iStaffMember, iStaffAssignResponse, iStaffRemoveResponse } from "../types";
import { useCache } from "./useCache";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskStaff {
	staff: iStaffMember[];
	staffLoading: boolean;
	staffError: string | undefined;
	staffMessage: string | undefined;
	fetchStaff: (merchantId: string) => Promise<iStaffMember[]>;

	assignStaff: (merchantId: string, input: string) => Promise<iStaffAssignResponse | undefined>;
	assignStaffLoading: boolean;
	assignStaffError: string | undefined;
	assignStaffMessage: string | undefined;

	removeStaff: (merchantId: string, staffId: string) => Promise<iStaffRemoveResponse | undefined>;
	removeStaffLoading: boolean;
	removeStaffError: string | undefined;
	removeStaffMessage: string | undefined;
}

export function useLiskStaff({ apiKey }: { apiKey?: string }): iUseLiskStaff {
	const { getCache, setCache } = useCache();

	// fetchStaff states
	const [staff, setStaff] = useState<iStaffMember[]>([]);
	const [staffLoading, setStaffLoading] = useState(false);
	const [staffError, setStaffError] = useState<string | undefined>(undefined);
	const [staffMessage, setStaffMessage] = useState<string | undefined>(undefined);

	// assignStaff states
	const [assignStaffLoading, setAssignStaffLoading] = useState(false);
	const [assignStaffError, setAssignStaffError] = useState<string | undefined>(undefined);
	const [assignStaffMessage, setAssignStaffMessage] = useState<string | undefined>(undefined);

	// removeStaff states
	const [removeStaffLoading, setRemoveStaffLoading] = useState(false);
	const [removeStaffError, setRemoveStaffError] = useState<string | undefined>(undefined);
	const [removeStaffMessage, setRemoveStaffMessage] = useState<string | undefined>(undefined);

	// reset assign/remove states after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setStaffError(undefined);
			setStaffMessage(undefined);

			setAssignStaffError(undefined);
			setAssignStaffMessage(undefined);

			setRemoveStaffError(undefined);
			setRemoveStaffMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		assignStaffError,
		assignStaffMessage,
		removeStaffError,
		removeStaffMessage,
		staffError,
		staffMessage,
	]);

	const fetchStaff = useCallback(
		async (merchantId: string) => {
			setStaffLoading(true);
			setStaffError(undefined);
			setStaffMessage(undefined);
			const cacheKey = `staff_list_${merchantId}`;
			try {
				const cached = getCache(cacheKey);
				if (cached) {
					setStaff(cached);
					setStaffLoading(false);
					setStaffMessage("Fetched staff from cache.");
					return cached;
				}

				const { data } = await axios.get<iStaffMember[]>(
					`${API_BASE}/staff/${encodeURIComponent(merchantId)}`,
					{ headers: { Authorization: apiKey } },
				);
				setStaff(data);
				setCache(cacheKey, data);
				setStaffMessage("Fetched staff successfully.");
				return data;
			} catch (err: any) {
				setStaffError(`Failed to fetch staff (${err.message || "Unknown error"}).`);
			} finally {
				setStaffLoading(false);
			}

			return [];
		},
		[apiKey, getCache, setCache],
	);

	const assignStaff = useCallback(
		async (merchantId: string, input: string) => {
			setAssignStaffLoading(true);
			setAssignStaffError(undefined);
			setAssignStaffMessage(undefined);
			try {
				const { data } = await axios.post<iStaffAssignResponse>(
					`${API_BASE}/staff/${encodeURIComponent(merchantId)}`,
					{ input },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setAssignStaffMessage(
					data.success ? "Staff assigned successfully." : "Failed to assign staff.",
				);
				await fetchStaff(merchantId);
				return data;
			} catch (err: any) {
				setAssignStaffError(err.response?.data?.message || "Failed to assign staff.");
			} finally {
				setAssignStaffLoading(false);
			}
		},
		[apiKey, fetchStaff],
	);

	const removeStaff = useCallback(
		async (merchantId: string, staffId: string) => {
			setRemoveStaffLoading(true);
			setRemoveStaffError(undefined);
			setRemoveStaffMessage(undefined);
			try {
				const { data } = await axios.delete<iStaffRemoveResponse>(
					`${API_BASE}/staff/${encodeURIComponent(merchantId)}/${encodeURIComponent(staffId)}`,
					{
						headers: {
							Authorization: apiKey,
						},
					},
				);
				setRemoveStaffMessage(
					data.success ? "Staff removed successfully." : "Failed to remove staff.",
				);
				await fetchStaff(merchantId);
				return data;
			} catch (err: any) {
				setRemoveStaffError("Failed to remove staff.");
				console.error(err);
			} finally {
				setRemoveStaffLoading(false);
			}
		},
		[apiKey, fetchStaff],
	);

	return {
		staff,
		staffLoading,
		staffError,
		staffMessage,
		fetchStaff,

		assignStaff,
		assignStaffLoading,
		assignStaffError,
		assignStaffMessage,

		removeStaff,
		removeStaffLoading,
		removeStaffError,
		removeStaffMessage,
	};
}
