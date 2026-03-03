"use client";

import { useEffect, useState, use } from "react";
import {
    fetchPayoutById,
    submitPayout,
    approvePayout,
    rejectPayout,
} from "../../../../lib/api";
import { useAuth } from "../../../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function PayoutDetailsPage(props) {
    const router = useRouter();

    const params = use(props.params);
    const id = params.id;

    const { user } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const [rejectReason, setRejectReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await fetchPayoutById(id);
            setData(result);
            setError(null);
        } catch (err) {
            const msg = err.message || "Failed to load details";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (actionFn, args = []) => {
        setActionLoading(true);
        try {
            await actionFn(id, ...args);
            await loadData();
            setShowRejectModal(false);
            setRejectReason("");
            toast.success("Action successful!");
        } catch (err) {
            toast.error(err.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading)
        return <div className="p-8 text-center">Loading details...</div>;

    if (error)
        return (
            <div className="p-8 text-red-500 text-center font-medium">
                {error}
            </div>
        );

    if (!data) return null;

    const { payout, audits = [] } = data;

    const canSubmit =
        user?.role === "OPS" && payout.status === "Draft";

    const canApprove =
        user?.role === "FINANCE" &&
        payout.status === "Submitted";

    const canReject =
        user?.role === "FINANCE" &&
        payout.status === "Submitted";

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "Draft":
                return "bg-gray-100 text-gray-800";
            case "Submitted":
                return "bg-blue-100 text-blue-800";
            case "Approved":
                return "bg-green-100 text-green-800";
            case "Rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Payout Details
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            ID: {payout._id}
                        </p>
                    </div>

                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(
                            payout.status
                        )}`}
                    >
                        {payout.status}
                    </span>
                </div>

                <div className="px-4 py-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Vendor</p>
                        <p className="font-semibold">
                            {payout.vendor_id?.name || "Unknown"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold">₹{payout.amount}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Mode</p>
                        <p>{payout.mode}</p>
                    </div>

                    {payout.note && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Note</p>
                            <p className="bg-gray-50 p-3 rounded">
                                {payout.note}
                            </p>
                        </div>
                    )}

                    {payout.status === "Rejected" &&
                        payout.decision_reason && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-red-600">
                                    Rejection Reason
                                </p>
                                <p className="bg-red-50 p-3 rounded border border-red-200">
                                    {payout.decision_reason}
                                </p>
                            </div>
                        )}
                </div>

                {(canSubmit || canApprove || canReject) && (
                    <div className="px-4 py-4 bg-gray-50 border-t flex gap-3 justify-end">
                        {canSubmit && (
                            <button
                                onClick={() => handleAction(submitPayout)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Submit"}
                            </button>
                        )}

                        {canApprove && (
                            <button
                                onClick={() => handleAction(approvePayout)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-white bg-green-600 rounded disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Approve"}
                            </button>
                        )}

                        {canReject && (
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-white bg-red-600 rounded disabled:opacity-50"
                            >
                                Reject
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-medium">
                            Reject Payout
                        </h3>

                        <textarea
                            rows={4}
                            className="mt-4 w-full border rounded-md px-3 py-2"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) =>
                                setRejectReason(e.target.value)
                            }
                        />

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={
                                    !rejectReason.trim() || actionLoading
                                }
                                onClick={() =>
                                    handleAction(rejectPayout, [
                                        rejectReason,
                                    ])
                                }
                                className="px-4 py-2 text-white bg-red-600 rounded disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 border-b">
                    <h3 className="text-lg font-medium">
                        Audit Trail
                    </h3>
                </div>

                <div className="px-4 py-5">
                    {audits.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No audit history available.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {audits.map((event) => (
                                <li
                                    key={event._id}
                                    className="border p-3 rounded text-sm"
                                >
                                    <p>
                                        <strong>{event.action}</strong> by{" "}
                                        {event.user_id?.email ||
                                            "Unknown"}
                                    </p>
                                    <p className="text-gray-500">
                                        {new Date(
                                            event.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}