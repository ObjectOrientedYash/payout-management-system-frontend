"use client";
import { useState } from 'react';
import { createVendor } from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function NewVendorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        upi_id: '',
        bank_account: '',
        ifsc: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.upi_id && !formData.bank_account)
            newErrors.payment = "Either UPI ID or Bank Account is required";
        if (formData.bank_account && !formData.ifsc)
            newErrors.ifsc = "IFSC is required with Bank Account";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            await createVendor(formData);
            toast.success('Vendor added successfully');
            router.push('/dashboard/vendors');
        } catch (err) {
            toast.error(err.message || 'Failed to create vendor');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Vendor
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                {errors.payment && (
                    <p className="text-red-500 text-sm">{errors.payment}</p>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        UPI ID
                    </label>
                    <input
                        type="text"
                        name="upi_id"
                        value={formData.upi_id}
                        onChange={handleChange}
                        placeholder="e.g., example@upi"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Bank Account
                        </label>
                        <input
                            type="text"
                            name="bank_account"
                            value={formData.bank_account}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            IFSC Code
                        </label>
                        <input
                            type="text"
                            name="ifsc"
                            value={formData.ifsc}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${errors.ifsc ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.ifsc && (
                            <p className="text-red-500 text-sm mt-1">{errors.ifsc}</p>
                        )}
                    </div>
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
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Saving...' : 'Save Vendor'}
                    </button>
                </div>
            </form>
        </div>
    );
}