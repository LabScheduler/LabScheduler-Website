'use client';
import axiosConfig from "@/config/axios";
import { DataResponse } from "@/types/DataResponse";
import axios from "axios";
import { Router } from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuthResponse {
    token: string;
    role: string;
}

interface AuthRequest {
    username: string;
    password: string;
}

interface JwtPayload {
    sub: string;
    authorities: string[];
    exp: number;
    iat: number;
    jti: number;
}

class AuthService {
    async login(authRequest: AuthRequest): Promise<DataResponse<AuthResponse>> {
    try {
            const response = await axios.post<DataResponse<AuthResponse>>(`${API_URL}/auth/login`, authRequest, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!(response.status === 200)) {
                const error = await response.data.message;
                throw new Error("Đăng nhập không thành công!");
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem("token", response.data.data.token);
            }
            return response.data;
        } catch (error) {
            throw new Error("Có lỗi xảy ra trong quá trình đăng nhập!");
        }
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("token"); 
            window.location.href = "/login";
        }
    }

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("token");
        }
        return null;
    }

    getPayload(token: string): JwtPayload | null {
        if (token) {
            const payload = token.split(".")[1];
            try {
                return JSON.parse(atob(payload)) as JwtPayload;
            } catch (error) {
                console.error("Failed to parse token payload:", error);
                return null;
            }
        }
        return null;
    }

    getRole(token?:string): string{
        const storedToken = token || this.getToken();
        if (storedToken) {
            const payload = this.getPayload(storedToken);
            return payload?.authorities[0] || "";
        }
        return "";
    }

    isTokenExpired(token: string): boolean {
        const payload = this.getPayload(token);
        if (payload) {
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        }
        return true;
    }

    isAuthenticated(token?: string): boolean {
        const storedToken = token || this.getToken();
        if (storedToken) {
            return !this.isTokenExpired(storedToken);
        }
        return false;
    }

    getUserId(token?: string): number | null {
        const storedToken = token || this.getToken();
        if (token) {
            const payload = this.getPayload(token);
            console.log("payload", payload);
            return payload?.jti || null;
        }
        return null;
    }

    getUserName(token?: string): string | null {
        const storedToken = token || this.getToken();
        if (storedToken) {
            const payload = this.getPayload(storedToken);
            return payload?.sub || null;
        }
        return null;
    }
}

export default new AuthService();