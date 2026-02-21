import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { addressAPI } from '../services/api'
import {
    MapPin,
    Plus,
    Trash2,
    Star,
    ArrowLeft,
    Edit2,
    Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

const AddressForm = ({ onSuccess, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        fullname: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        phone: '',
        is_default: false,
        ...initialData,
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (initialData) {
                await addressAPI.updateAddress(initialData.id, formData)
                toast.success('Address updated successfully')
            } else {
                await addressAPI.createAddress(formData)
                toast.success('Address added successfully')
            }
            onSuccess()
        } catch (error) {
            const errors = error.response?.data || {}
            const message =
                Object.values(errors).flat()[0] || 'Failed to save address'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.fullname}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                fullname: e.target.value,
                            })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        Street Address *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) =>
                            setFormData({ ...formData, street: e.target.value })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        City *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        State *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        ZIP Code *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.zipcode}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                zipcode: e.target.value,
                            })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-stone-900 mb-2">
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-5 py-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/5 transition-all text-stone-900 placeholder:text-stone-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <input
                    type="checkbox"
                    id="default-addr"
                    checked={formData.is_default}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            is_default: e.target.checked,
                        })
                    }
                    className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900/5 cursor-pointer"
                />
                <label
                    htmlFor="default-addr"
                    className="text-sm font-medium text-stone-900 cursor-pointer"
                >
                    Set as default address
                </label>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-all duration-300 cursor-pointer"
                >
                    {loading ? 'Saving...' : initialData ? 'Update' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold rounded-xl transition-all duration-300 cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

const Addresses = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectUrl = searchParams.get('redirect')

    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        try {
            const { data } = await addressAPI.getAllAddresses()
            const addressList = Array.isArray(data) ? data : data.results || []
            setAddresses(addressList)
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            await addressAPI.deleteAddress(id)
            toast.success('Address deleted')
            fetchAddresses()
        } catch (error) {
            toast.error('Failed to delete address', error)
        }
    }

    const handleSetDefault = async (id) => {
        try {
            await addressAPI.setDefaultAddress(id)
            toast.success('Default address updated')
            fetchAddresses()
        } catch (error) {
            toast.error('Failed to set default address', error)
        }
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingAddress(null)
        fetchAddresses()
        if (redirectUrl) {
            navigate(redirectUrl)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-gradient-to-br from-stone-50 to-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
                    <p className="text-stone-500 font-medium">Loading addresses...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-gradient-to-br from-stone-50 via-white to-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
                            My Addresses
                        </h1>
                        <p className="text-stone-600 mt-2 font-medium">
                            Manage your delivery addresses
                        </p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <Plus size={18} />
                            Add New
                        </button>
                    )}
                </div>

                {/* Form Section */}
                {showForm && (
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-10 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-stone-900">
                                {editingAddress
                                    ? 'Edit Address'
                                    : 'Add New Address'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingAddress(null)
                                }}
                                className="text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>
                        <AddressForm
                            initialData={editingAddress}
                            onSuccess={handleFormSuccess}
                            onCancel={() => {
                                setShowForm(false)
                                setEditingAddress(null)
                            }}
                        />
                    </div>
                )}

                {/* Addresses List */}
                {addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-6">
                            <MapPin
                                size={40}
                                className="text-stone-400"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-3">
                            No addresses saved
                        </h2>
                        <p className="text-stone-600 mb-8 font-medium">
                            Add an address to use during checkout
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-all duration-300 cursor-pointer"
                        >
                            <Plus size={18} />
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="bg-white rounded-2xl border border-stone-200 p-7 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <p className="text-lg font-bold text-stone-900">
                                                {address.fullname}
                                            </p>
                                            {address.is_default && (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                                                    <Star
                                                        size={12}
                                                        className="fill-current"
                                                    />
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-stone-600 space-y-1">
                                            <p className="font-medium">
                                                {address.street}
                                            </p>
                                            <p className="text-sm">
                                                {address.city},{' '}
                                                {address.state} -{' '}
                                                {address.zipcode}
                                            </p>
                                            {address.phone && (
                                                <p className="text-sm mt-2">
                                                    <span className="font-medium">
                                                        Phone:
                                                    </span>{' '}
                                                    {address.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {!address.is_default && (
                                            <button
                                                onClick={() =>
                                                    handleSetDefault(address.id)
                                                }
                                                className="px-3.5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditingAddress(address)
                                                setShowForm(true)
                                            }}
                                            className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200 cursor-pointer"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(address.id)
                                            }
                                            className="p-2.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Addresses