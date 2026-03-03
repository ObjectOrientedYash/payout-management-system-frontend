"use client";
import { useState, useEffect } from 'react';
import { createPayout, fetchVendors } from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function NewPayoutPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({
        vendor_id: '',
        amount: '',
        mode: 'UPI',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchVendors()
            .then(setVendors)
            .catch(() => toast.error('Failed to load vendors'));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
        if (!formData.amount) newErrors.amount = "Amount is required";
        else if (Number(formData.amount) <= 0)
            newErrors.amount = "Amount must be greater than 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            await createPayout(formData);
            toast.success('Payout created successfully');
            router.push('/dashboard/payouts');
        } catch (err) {
            toast.error(err.message || 'Failed to create payout request');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Create Payout Request
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Vendor *
                    </label>
                    <select
                        name="vendor_id"
                        value={formData.vendor_id}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${errors.vendor_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="" disabled>Select a vendor</option>
                        {vendors.map(v => (
                            <option key={v._id} value={v._id}>
                                {v.name} ({v.bank_account || v.upi_id})
                            </option>
                        ))}
                    </select>
                    {errors.vendor_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.vendor_id}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Amount (₹) *
                        </label>
                        <input
                            type="number"
                            name="amount"
                            min="0.01"
                            step="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mode *
                        </label>
                        <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border"
                        >
                            <option value="UPI">UPI</option>
                            <option value="IMPS">IMPS</option>
                            <option value="NEFT">NEFT</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Note
                    </label>
                    <textarea
                        name="note"
                        rows={3}
                        value={formData.note}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border"
                        placeholder="Optional details..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Creating...' : 'Create Payout (Draft)'}
                    </button>
                </div>
            </form>
        </div>
    );
}