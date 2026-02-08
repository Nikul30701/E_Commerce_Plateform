import React, {useState} from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const Register = () => {
    const {register} = useAuthStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email:'',
        first_name:'',
        last_name:'',
        phone: '',
        password:'',
        confirm_password:'',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(formData);

        setLoading(false);
        if (result.success) {
            navigate('/login');
        }
    }
  return (
    <div className='min-h-screen flex justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full bg-slate-300 p-8 rounded-lg shadow-md'>

            {/* Header */}
            <div className='text-center mb-8'>
                <div className='flex justify-center mb-4'>
                    <ShoppingCart className="h-12 w-12 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
                <p className="mt-2 text-gray-600">Join us and start shopping</p>
            </div>

            {/* Form */}
            <div className='bg-white rounded-lg shadow-md p-8'>
                <form
                    onSubmit={handleSubmit}
                    className='space-y-5'
                >
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>First Name</label>
                        <input
                            type="text"
                            required
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Last Name</label>
                        <input
                            type="text"
                            required
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Phone</label>
                        <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

            </div>
        </div>
    </div>
  )
}

export default Register;
