const API_BASE = 'http://localhost:5000/api/auth';

/**
 * Login with username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ok: boolean, data?: object, message?: string}>}
 */
export async function login(username, password) {
	try {
		const res = await fetch(`${API_BASE}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		});

		const data = await res.json();

		if (!res.ok) {
			return { ok: false, message: data.message || 'Login failed' };
		}

		return { ok: true, data };
	} catch (error) {
		return { ok: false, message: 'Network error. Is the server running?' };
	}
}

/**
 * Update user profile
 * @param {object} profileData { firstName, lastName, email, password }
 * @returns {Promise<{ok: boolean, data?: object, message?: string}>}
 */
export async function updateProfile(profileData) {
	try {
		const token = localStorage.getItem('token');
		const res = await fetch(`${API_BASE}/profile`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(profileData),
		});

		const data = await res.json();

		if (!res.ok) {
			return { ok: false, message: data.message || 'Profile update failed' };
		}

		return { ok: true, data };
	} catch (error) {
		return { ok: false, message: 'Network error. Is the server running?' };
	}
}

/**
 * Verify identity for password reset
 * @param {string} username
 * @param {string} email
 * @returns {Promise<{ok: boolean, data?: object, message?: string}>}
 */
export async function forgotPassword(username, email) {
	try {
		const res = await fetch(`${API_BASE}/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email }),
		});

		const data = await res.json();

		if (!res.ok) {
			return { ok: false, message: data.message || 'Verification failed' };
		}

		return { ok: true, data };
	} catch (error) {
		return { ok: false, message: 'Network error. Is the server running?' };
	}
}

/**
 * Reset password using a reset token
 * @param {string} token - Reset token from forgotPassword
 * @param {string} newPassword
 * @returns {Promise<{ok: boolean, message?: string}>}
 */
export async function resetPassword(token, newPassword) {
	try {
		const res = await fetch(`${API_BASE}/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, newPassword }),
		});

		const data = await res.json();

		if (!res.ok) {
			return { ok: false, message: data.message || 'Password reset failed' };
		}

		return { ok: true, message: data.message };
	} catch (error) {
		return { ok: false, message: 'Network error. Is the server running?' };
	}
}
