import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem('user');
		try {
			return savedUser ? JSON.parse(savedUser) : null;
		} catch (error) {
			console.error('Failed to parse user from localStorage:', error);
			return null;
		}
	});

	const value = useMemo(() => ({ user, setUser }), [user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
