import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { iApiToken, iApiTokenCreateResponse, iApiTokenRevokeResponse } from "../types";
import { useCache } from "../hooks/useCache";

const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskApiTokens {
	tokens: iApiToken[];
	apiTokenLoading: boolean;
	apiTokenError: string | undefined;
	apiTokenMessage: string | undefined;
	fetchTokens: () => Promise<void>;

	createToken: (description: string) => Promise<void>;
	createTokenLoading: boolean;
	createTokenError: string | undefined;
	createTokenMessage: string | undefined;
	createdToken: iApiTokenCreateResponse | undefined;

	updateToken: (id: string, description: string) => Promise<void>;
	updateTokenLoading: boolean;
	updateTokenError: string | undefined;
	updateTokenMessage: string | undefined;

	revokeToken: (id: string) => Promise<void>;
	revokeTokenLoading: boolean;
	revokeTokenError: string | undefined;
	revokeTokenMessage: string | undefined;
}

/**
 * Custom React hook for managing API tokens via the Lisk API.
 *
 * Provides functionality to fetch, create, update, and revoke API tokens,
 * with built-in caching and loading/error state management.
 *
 * @param apiKey - Optional API key used for authorization in requests.
 * @returns An object containing:
 * - `tokens`: Array of fetched API tokens.
 * - `apiTokenLoading`: Loading state for fetching tokens.
 * - `apiTokenError`: Error message for fetching tokens.
 * - `fetchTokens`: Function to fetch tokens from the API.
 * - `createToken`: Function to create a new API token.
 * - `createTokenLoading`: Loading state for creating a token.
 * - `createTokenError`: Error message for creating a token.
 * - `createdToken`: Response data for the created token.
 * - `updateToken`: Function to update an existing token's description.
 * - `updateTokenLoading`: Loading state for updating a token.
 * - `updateTokenError`: Error message for updating a token.
 * - `revokeToken`: Function to revoke an API token.
 * - `revokeTokenLoading`: Loading state for revoking a token.
 * - `revokeTokenError`: Error message for revoking a token.
 * - `revokeTokenSuccess`: Success message for revoking a token.
 */
export function useLiskApiTokens({ apiKey }: { apiKey?: string }): iUseLiskApiTokens {
	const { getCache, setCache } = useCache();

	const [tokens, setTokens] = useState<iApiToken[]>([]);
	const [apiTokenLoading, setApiTokenLoading] = useState(false);
	const [apiTokenError, setApiTokenError] = useState<string | undefined>(undefined);
	const [apiTokenMessage, setApiTokenMessage] = useState<string | undefined>(undefined);

	const [createTokenLoading, setCreateTokenLoading] = useState(false);
	const [createTokenError, setCreateTokenError] = useState<string | undefined>(undefined);
	const [createTokenMessage, setCreateTokenMessage] = useState<string | undefined>(undefined);
	const [createdToken, setCreatedToken] = useState<iApiTokenCreateResponse | undefined>(
		undefined,
	);

	const [updateTokenLoading, setUpdateTokenLoading] = useState(false);
	const [updateTokenError, setUpdateTokenError] = useState<string | undefined>(undefined);
	const [updateTokenMessage, setUpdateTokenMessage] = useState<string | undefined>(undefined);

	const [revokeTokenLoading, setRevokeTokenLoading] = useState(false);
	const [revokeTokenError, setRevokeTokenError] = useState<string | undefined>(undefined);
	const [revokeTokenMessage, setRevokeTokenMessage] = useState<string | undefined>(undefined);

	// clear all errors and message after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setApiTokenError(undefined);
			setApiTokenMessage(undefined);

			setCreateTokenError(undefined);
			setCreateTokenMessage(undefined);

			setCreatedToken(undefined);
			setUpdateTokenError(undefined);

			setUpdateTokenMessage(undefined);
			setUpdateTokenMessage(undefined);

			setRevokeTokenError(undefined);
			setRevokeTokenMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		apiTokenError,
		apiTokenMessage,

		createTokenError,
		createTokenMessage,

		updateTokenError,
		updateTokenMessage,

		revokeTokenError,
		revokeTokenMessage,
	]);

	const fetchTokens = useCallback(async () => {
		const cacheKey = "api_tokens";
		setApiTokenLoading(true);
		setApiTokenError(undefined);
		try {
			const cached = getCache(cacheKey);
			if (cached) {
				setTokens(cached);
				setApiTokenLoading(false);
				return;
			}

			const { data } = await axios.get<iApiToken[]>(`${API_BASE}/tokens`, {
				headers: {
					Authorization: apiKey,
				},
			});
			setTokens(data);
			setCache(cacheKey, data);
			setApiTokenMessage("Tokens fetched successfully.");
		} catch (err: any) {
			setApiTokenError("Failed to fetch tokens.");
			console.error("Error fetching tokens:", err);
		} finally {
			setApiTokenLoading(false);
		}
	}, [apiKey, getCache, setCache]);

	const createToken = useCallback(
		async (description: string) => {
			setCreateTokenLoading(true);
			setCreateTokenError(undefined);
			setCreatedToken(undefined);
			try {
				const { data } = await axios.post<iApiTokenCreateResponse>(
					`${API_BASE}/tokens`,
					{ description },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setCreatedToken(data);
				setCreateTokenMessage("Token created successfully.");
				fetchTokens();
			} catch (err: any) {
				setCreateTokenError("Failed to create token.");
				console.error("Error creating token:", err);
			} finally {
				setCreateTokenLoading(false);
			}
		},
		[apiKey, fetchTokens],
	);

	const updateToken = useCallback(
		async (id: string, description: string) => {
			setUpdateTokenLoading(true);
			setUpdateTokenError(undefined);
			try {
				await axios.patch<iApiToken>(
					`${API_BASE}/tokens/${id}`,
					{ description },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				fetchTokens();
				setUpdateTokenMessage("Token updated successfully.");
			} catch (err: any) {
				setUpdateTokenError("Failed to update token.");
				console.error("Error updating token:", err);
			} finally {
				setUpdateTokenLoading(false);
			}
		},
		[apiKey, fetchTokens],
	);

	const revokeToken = useCallback(
		async (id: string) => {
			setRevokeTokenLoading(true);
			setRevokeTokenError(undefined);
			setRevokeTokenMessage(undefined);
			try {
				const { data } = await axios.post<iApiTokenRevokeResponse>(
					`${API_BASE}/tokens/revoke`,
					{ id },
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setRevokeTokenMessage(data.message);
				fetchTokens();
			} catch (err: any) {
				setRevokeTokenError("Failed to revoke token.");
				console.error("Error revoking token:", err);
			} finally {
				setRevokeTokenLoading(false);
			}
		},
		[apiKey, fetchTokens],
	);

	return {
		tokens,
		apiTokenLoading,
		apiTokenError,
		fetchTokens,
		apiTokenMessage,

		createToken,
		createTokenLoading,
		createTokenError,
		createdToken,
		createTokenMessage,

		updateToken,
		updateTokenLoading,
		updateTokenError,
		updateTokenMessage,

		revokeToken,
		revokeTokenLoading,
		revokeTokenError,
		revokeTokenMessage,
	};
}
