import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { iCoupon, iCouponCreateRequest, iCouponUpdateRequest, iCouponResponse } from "../types";
import { useCache } from "../hooks/useCache";
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskCoupons {
	coupons: iCoupon[];
	couponsLoading: boolean;
	couponsError: string | undefined;
	fetchCoupons: () => Promise<void>;

	createCoupon: (
		userId: string,
		coupon: iCouponCreateRequest,
	) => Promise<iCouponResponse | undefined>;
	createCouponLoading: boolean;
	createCouponError: string | undefined;
	createCouponMessage: string | undefined;

	claimCoupon: (userId: string, couponId: string) => Promise<iCouponResponse | undefined>;
	claimCouponLoading: boolean;
	claimCouponError: string | undefined;
	claimCouponMessage: string | undefined;

	updateCoupon: (
		userId: string,
		couponId: string,
		coupon: iCouponUpdateRequest,
	) => Promise<iCouponResponse | undefined>;
	updateCouponLoading: boolean;
	updateCouponError: string | undefined;
	updateCouponMessage: string | undefined;

	deleteCoupon: (userId: string, couponId: string) => Promise<void>;
	deleteCouponLoading: boolean;
	deleteCouponError: string | undefined;
	deleteCouponMessage: string | undefined;
}

export function useLiskCoupons({ apiKey }: { apiKey?: string }): iUseLiskCoupons {
	const { getCache, setCache } = useCache();

	const [coupons, setCoupons] = useState<iCoupon[]>([]);
	const [couponsLoading, setCouponsLoading] = useState(false);
	const [couponsError, setCouponsError] = useState<string | undefined>(undefined);

	// Create coupon states
	const [createCouponLoading, setCreateCouponLoading] = useState(false);
	const [createCouponError, setCreateCouponError] = useState<string | undefined>(undefined);
	const [createCouponMessage, setCreateCouponMessage] = useState<string | undefined>(undefined);

	// Claim coupon states
	const [claimCouponLoading, setClaimCouponLoading] = useState(false);
	const [claimCouponError, setClaimCouponError] = useState<string | undefined>(undefined);
	const [claimCouponMessage, setClaimCouponMessage] = useState<string | undefined>(undefined);

	// Update coupon states
	const [updateCouponLoading, setUpdateCouponLoading] = useState(false);
	const [updateCouponError, setUpdateCouponError] = useState<string | undefined>(undefined);
	const [updateCouponMessage, setUpdateCouponMessage] = useState<string | undefined>(undefined);

	// Delete coupon states
	const [deleteCouponLoading, setDeleteCouponLoading] = useState(false);
	const [deleteCouponError, setDeleteCouponError] = useState<string | undefined>(undefined);
	const [deleteCouponMessage, setDeleteCouponMessage] = useState<string | undefined>(undefined);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCouponsError(undefined);

			setCreateCouponError(undefined);
			setCreateCouponMessage(undefined);

			setClaimCouponError(undefined);
			setClaimCouponMessage(undefined);

			setUpdateCouponError(undefined);
			setUpdateCouponMessage(undefined);

			setDeleteCouponError(undefined);
			setDeleteCouponMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		couponsError,
		createCouponError,
		createCouponMessage,
		claimCouponError,
		claimCouponMessage,
		updateCouponError,
		updateCouponMessage,
		deleteCouponError,
		deleteCouponMessage,
	]);

	// Get all coupons
	const fetchCoupons = useCallback(async () => {
		setCouponsLoading(true);
		setCouponsError(undefined);
		const cacheKey = `coupons`;
		try {
			const cached = getCache(cacheKey);
			if (cached) {
				setCoupons(cached);
				setCouponsLoading(false);
				return;
			}

			const { data } = await axios.get<iCoupon[]>(`${API_BASE}/coupons`, {
				headers: { Authorization: apiKey },
			});
			setCoupons(data);
			setCache(cacheKey, data);
		} catch (err: any) {
			setCouponsError("Failed to fetch coupons.");
			console.error(err);
		} finally {
			setCouponsLoading(false);
		}
	}, [apiKey, getCache, setCache]);

	// Create a new coupon for a user
	const createCoupon = useCallback(
		async (userId: string, coupon: iCouponCreateRequest) => {
			setCreateCouponLoading(true);
			setCreateCouponError(undefined);
			setCreateCouponMessage(undefined);
			try {
				const { data } = await axios.post<iCouponResponse>(
					`${API_BASE}/coupons/${encodeURIComponent(userId)}`,
					coupon,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setCreateCouponMessage("Coupon created successfully.");
				await fetchCoupons();
				return data;
			} catch (err: any) {
				setCreateCouponError("Failed to create coupon.");
				console.error(err);
			} finally {
				setCreateCouponLoading(false);
			}
		},
		[apiKey, fetchCoupons],
	);

	// Claim a coupon for a user
	const claimCoupon = useCallback(
		async (userId: string, couponId: string) => {
			setClaimCouponLoading(true);
			setClaimCouponError(undefined);
			setClaimCouponMessage(undefined);
			try {
				const { data } = await axios.patch<iCouponResponse>(
					`${API_BASE}/coupons/claim/${encodeURIComponent(userId)}`,
					{ couponId },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setClaimCouponMessage("Coupon claimed successfully.");
				await fetchCoupons();
				return data;
			} catch (err: any) {
				setClaimCouponError("Failed to claim coupon.");
				console.error(err);
			} finally {
				setClaimCouponLoading(false);
			}
		},
		[apiKey, fetchCoupons],
	);

	// Update a coupon for a user
	const updateCoupon = useCallback(
		async (userId: string, couponId: string, coupon: iCouponUpdateRequest) => {
			setUpdateCouponLoading(true);
			setUpdateCouponError(undefined);
			setUpdateCouponMessage(undefined);
			try {
				const { data } = await axios.put<iCouponResponse>(
					`${API_BASE}/coupons/${encodeURIComponent(userId)}/${encodeURIComponent(couponId)}`,
					coupon,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setUpdateCouponMessage("Coupon updated successfully.");
				await fetchCoupons();
				return data;
			} catch (err: any) {
				setUpdateCouponError("Failed to update coupon.");
				console.error(err);
			} finally {
				setUpdateCouponLoading(false);
			}
		},
		[apiKey, fetchCoupons],
	);

	// Delete a coupon for a user
	const deleteCoupon = useCallback(
		async (userId: string, couponId: string) => {
			setDeleteCouponLoading(true);
			setDeleteCouponError(undefined);
			setDeleteCouponMessage(undefined);
			try {
				await axios.delete(
					`${API_BASE}/coupons/${encodeURIComponent(userId)}/${encodeURIComponent(couponId)}`,
					{
						headers: {
							Authorization: apiKey,
						},
					},
				);
				setDeleteCouponMessage("Coupon deleted successfully.");
				await fetchCoupons();
			} catch (err: any) {
				setDeleteCouponError("Failed to delete coupon.");
				console.error(err);
			} finally {
				setDeleteCouponLoading(false);
			}
		},
		[apiKey, fetchCoupons],
	);

	return {
		coupons,
		couponsLoading,
		couponsError,
		fetchCoupons,

		createCoupon,
		createCouponLoading,
		createCouponError,
		createCouponMessage,

		claimCoupon,
		claimCouponLoading,
		claimCouponError,
		claimCouponMessage,

		updateCoupon,
		updateCouponLoading,
		updateCouponError,
		updateCouponMessage,

		deleteCoupon,
		deleteCouponLoading,
		deleteCouponError,
		deleteCouponMessage,
	};
}
