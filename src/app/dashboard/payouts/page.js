"use client";
import { useEffect, useState } from 'react';
import { fetchPayouts, fetchVendors } from '../../../lib/api.js';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext.js';

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [vendorFilter, setVendorFilter] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        loadData();
    }, [statusFilter, vendorFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (vendorFilter) filters.vendor_id = vendorFilter;

            const [payoutsData, vendorsData] = await Promise.all([
                fetchPayouts(filters),
                fetchVendors()
            ]);
            setPayouts(payoutsData);
            setVendors(vendorsData);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Payout Requests</h1>
                    <p className="mt-2 text-sm text-gray-700">List of all payouts with their current status.</p>
                </div>
                {user?.role === 'OPS' && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link
                            href="/dashboard/payouts/new"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Create Payout
                        </Link>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                    >
                        <option value="">All</option>
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                    <select
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                    >
                        <option value="">All</option>
                        {vendors.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error ? (
                <div className="p-4 text-red-500 text-center mt-4">{error}</div>
            ) : loading ? (
                <div className="p-4 text-center mt-4">Loading payouts...</div>
            ) : (
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Vendor</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mode</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">View</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {payouts.map((payout) => (
                                            <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{payout.vendor_id?.name || 'Unknown'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{payout.amount}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payout.mode}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(payout.status)}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(payout.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link href={`/dashboard/payouts/${payout._id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 bg-indigo-50 rounded-md">
                                                        Details <span className="sr-only">, {payout._id}</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {payouts.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-sm text-gray-500">No payouts found matching criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
