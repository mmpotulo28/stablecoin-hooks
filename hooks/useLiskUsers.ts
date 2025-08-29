"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { iUser } from "../types"; // changed from "@/types"
import { useCache } from "./useCache";

// Use environment variables
const API_BASE = process.env.NEXT_PUBLIC_LISK_API_BASE as string;

export interface iUseLiskUsers {
	users: iUser[];
	usersLoading: boolean;
	usersError: string | undefined;
	usersMessage: string | undefined;
	fetchUsers: () => Promise<iUser[]>;

	getUser: ({ id }: { id: string }) => Promise<iUser | null>;
	getUserLoading: boolean;
	getUserError: string | undefined;
	getUserMessage: string | undefined;

	createUser: (data: iUser) => Promise<iUser | null>;
	createUserLoading: boolean;
	createUserError: string | undefined;
	createUserMessage: string | undefined;

	updateUser: (id: string, data: Partial<iUser>) => Promise<iUser | null>;
	updateUserLoading: boolean;
	updateUserError: string | undefined;
	updateUserMessage: string | undefined;

	deleteUser: (id: string) => Promise<{ message: string } | null>;
	deleteUserLoading: boolean;
	deleteUserError: string | undefined;
	deleteUserMessage: string | undefined;

	singleUser: iUser | null;
}

export const useLiskUsers = ({ apiKey }: { apiKey?: string }): iUseLiskUsers => {
	const { getCache, setCache } = useCache();

	// users states
	const [users, setUsers] = useState<iUser[]>([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [usersError, setUsersError] = useState<string | undefined>(undefined);
	const [usersMessage, setUsersMessage] = useState<string | undefined>(undefined);

	// getUser states
	const [getUserLoading, setGetUserLoading] = useState(false);
	const [getUserError, setGetUserError] = useState<string | undefined>(undefined);
	const [getUserMessage, setGetUserMessage] = useState<string | undefined>(undefined);

	// createUser states
	const [createUserLoading, setCreateUserLoading] = useState(false);
	const [createUserError, setCreateUserError] = useState<string | undefined>(undefined);
	const [createUserMessage, setCreateUserMessage] = useState<string | undefined>(undefined);

	// updateUser states
	const [updateUserLoading, setUpdateUserLoading] = useState(false);
	const [updateUserError, setUpdateUserError] = useState<string | undefined>(undefined);
	const [updateUserMessage, setUpdateUserMessage] = useState<string | undefined>(undefined);

	// deleteUser states
	const [deleteUserLoading, setDeleteUserLoading] = useState(false);
	const [deleteUserError, setDeleteUserError] = useState<string | undefined>(undefined);
	const [deleteUserMessage, setDeleteUserMessage] = useState<string | undefined>(undefined);

	const [singleUser, setSingleUser] = useState<iUser | null>(null);

	// reset all messages and errors after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setUsersError(undefined);
			setUsersMessage(undefined);

			setGetUserError(undefined);
			setGetUserMessage(undefined);

			setCreateUserError(undefined);
			setCreateUserMessage(undefined);

			setUpdateUserError(undefined);
			setUpdateUserMessage(undefined);

			setDeleteUserError(undefined);
			setDeleteUserMessage(undefined);
		}, 3000);

		return () => clearTimeout(timer);
	}, [
		usersError,
		usersMessage,

		getUserError,
		getUserMessage,

		createUserError,
		createUserMessage,

		updateUserError,
		updateUserMessage,

		deleteUserError,
		deleteUserMessage,
	]);

	const fetchUsers = useCallback(async () => {
		setUsersLoading(true);
		setUsersError(undefined);
		setUsersMessage(undefined);
		const cacheKey = "users_list";

		try {
			const cached = getCache(cacheKey);
			if (cached) {
				setUsers(cached);
				setUsersLoading(false);
				setUsersMessage("Fetched users from cache.");
				return cached;
			}

			const { data } = await axios.get<{ users: iUser[] }>(`${API_BASE}/users`, {
				headers: { Authorization: apiKey },
			});
			setUsers(data.users || []);
			setCache(cacheKey, data.users || []);
			setUsersMessage("Fetched users successfully.");
			return data.users || [];
		} catch (err: any) {
			setUsersError(err?.response?.data?.message || "Failed to fetch users");
		} finally {
			setUsersLoading(false);
		}

		return [];
	}, [apiKey, getCache, setCache]);

	const getUser = useCallback(
		async ({ id }: { id: string }) => {
			setGetUserLoading(true);
			setGetUserError(undefined);
			setGetUserMessage(undefined);

			try {
				const existing = users.find((u) => u.id === id);
				if (existing) {
					setSingleUser(existing);
					setGetUserMessage("User found in list.");
					return existing;
				}

				const cached = getCache(`single_user`);
				if (cached) {
					setSingleUser(cached);
					setGetUserMessage("User found in cache.");
					return cached;
				}

				const { data } = await axios.get<{ user: iUser }>(`${API_BASE}/users/${id}`, {
					headers: { Authorization: apiKey },
				});
				setSingleUser(data.user);
				setGetUserMessage("Fetched user successfully.");
				return data.user;
			} catch (err: any) {
				setGetUserError(err?.response?.data?.message || "Failed to fetch user");
			} finally {
				setGetUserLoading(false);
			}

			return null;
		},
		[apiKey, getCache, users],
	);

	const createUser = useCallback(
		async (data: iUser) => {
			setCreateUserLoading(true);
			setCreateUserError(undefined);
			setCreateUserMessage(undefined);

			try {
				const { data: response } = await axios.post(`${API_BASE}/users`, data, {
					headers: { Authorization: apiKey },
				});
				setSingleUser(response);
				setCreateUserMessage("User created successfully.");
				await fetchUsers();
				return response;
			} catch (err: any) {
				setCreateUserError(err?.response?.data?.message || "Failed to create user");
			} finally {
				setCreateUserLoading(false);
			}

			return null;
		},
		[apiKey, fetchUsers],
	);

	const updateUser = useCallback(
		async (id: string, data: Partial<iUser>) => {
			setUpdateUserLoading(true);
			setUpdateUserError(undefined);
			setUpdateUserMessage(undefined);
			try {
				const { data: updatedUser } = await axios.put<iUser>(
					`${API_BASE}/users/${encodeURIComponent(id)}`,
					data,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: apiKey,
						},
					},
				);
				setSingleUser(updatedUser);
				setUpdateUserMessage("User updated successfully.");
				await fetchUsers();
				return updatedUser;
			} catch (err: any) {
				if (err?.response?.status === 400) setUpdateUserError("Validation error.");
				else if (err?.response?.status === 401) setUpdateUserError("Unauthorized.");
				else if (err?.response?.status === 404) setUpdateUserError("User not found.");
				else setUpdateUserError("Failed to update user.");
			} finally {
				setUpdateUserLoading(false);
			}
			return null;
		},
		[apiKey, fetchUsers],
	);

	const deleteUser = useCallback(
		async (id: string) => {
			setDeleteUserLoading(true);
			setDeleteUserError(undefined);
			setDeleteUserMessage(undefined);
			try {
				const { data } = await axios.delete<{ message: string }>(
					`${API_BASE}/users/${encodeURIComponent(id)}`,
					{
						headers: {
							Authorization: apiKey,
						},
					},
				);
				setDeleteUserMessage(data.message || "User deleted.");
				await fetchUsers();
				return data;
			} catch (err: any) {
				if (err?.response?.status === 400) setDeleteUserError("Invalid ID parameter.");
				else if (err?.response?.status === 401) setDeleteUserError("Unauthorized.");
				else if (err?.response?.status === 404) setDeleteUserError("User not found.");
				else setDeleteUserError("Failed to delete user.");
			} finally {
				setDeleteUserLoading(false);
			}
			return null;
		},
		[apiKey, fetchUsers],
	);

	return {
		users,
		usersLoading,
		usersError,
		usersMessage,
		fetchUsers,

		getUser,
		getUserLoading,
		getUserError,
		getUserMessage,

		createUser,
		createUserLoading,
		createUserError,
		createUserMessage,

		updateUser,
		updateUserLoading,
		updateUserError,
		updateUserMessage,

		deleteUser,
		deleteUserLoading,
		deleteUserError,
		deleteUserMessage,

		singleUser,
	};
};
