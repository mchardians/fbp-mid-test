'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if we have token in local storage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserData(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async (authToken) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            setUser(userData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
            setLoading(false);
        }
    };

    const register = async (name, email, password, phone) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw { response: { data } };
            }

            const { access_token, user } = data;

            setToken(access_token);
            setUser(user);
            localStorage.setItem('token', access_token);

            setLoading(false);
            return true;
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.data) {
                setError(error.response.data);
            } else {
                setError({ message: 'An unexpected error occurred' });
            }
            return false;
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw { response: { data } };
            }

            const { token, user } = data;

            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);

            setLoading(false);
            router.push('/dashboard');
            return true;
        } catch (error) {
            setLoading(false);

            if (error.response?.data) {
                const { message, errors } = error.response.data;
                let errorMessage = message;

                if (errors) {
                    errorMessage = Object.values(errors).flat().join(' ');
                }

                setError({ message: errorMessage });
            } else {
                setError({ message: 'Terjadi kesalahan tak terduga.' });
            }

            return false;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            router.push('/login');
        }
    };

    // Helper function for making authenticated requests
    const authFetch = async (url, options = {}) => {
        if (!token) {
            throw new Error('No authentication token available');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        try {
            const response = await fetch(`${API_URL}${url}`, {
                ...options,
                headers
            });

            // Handle token expiration
            if (response.status === 401) {
                // Try to refresh token or logout
                logout();
                throw new Error('Authentication token expired');
            }

            return response;
        } catch (error) {
            console.error('Error making authenticated request:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                register,
                login,
                logout,
                authFetch // Expose helper function for authenticated requests
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);