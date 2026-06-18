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
