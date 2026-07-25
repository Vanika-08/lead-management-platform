'use client';

import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api/client';
import type { UserDTO } from '@/types/dto';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
}
export interface UpdateUserPayload {
  name?: string;
  role?: 'ADMIN' | 'MEMBER';
  password?: string;
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiRequest<{ data: UserDTO }>('/api/users', 'POST', payload),
  });
}

export function useUpdateUser(id: string) {
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      apiRequest<{ data: UserDTO }>(`/api/users/${id}`, 'PUT', payload),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: string) => apiRequest<{ data: { id: string } }>(`/api/users/${id}`, 'DELETE'),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: { name: string; password?: string }) =>
      apiRequest<{ data: UserDTO }>('/api/profile', 'PUT', payload),
  });
}
