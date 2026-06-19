import axios from 'axios';
import toast from 'react-hot-toast';

window.axios = axios;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// ── Global error handling ────────────────────────────────────
// Surfaces a clear, consistent message when the backend blocks an action
// because the user's account is still pending admin approval (or rejected),
// instead of failing silently or looking like a random redirect/refresh.
let lastApprovalToast = 0;

axios.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;
        const data   = error?.response?.data;

        if (status === 403 && data?.approval_status) {
            // Debounce so rapid repeated failures don't spam multiple toasts
            const now = Date.now();
            if (now - lastApprovalToast > 4000) {
                lastApprovalToast = now;
                toast.error(data.message || 'Akun Anda belum disetujui admin untuk melakukan aksi ini.', { duration: 5000 });
            }
        }

        return Promise.reject(error);
    }
);

