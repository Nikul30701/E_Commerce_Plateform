import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, AlertCircle, X, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { register } = useAuthStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        gender: 'M',  // Added with default
        dob: '',      // Added
        password: '',
        confirm_password: '',
        profile_pic: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setFormData({
                ...formData,
                profile_pic: file 
            });
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        setFormData({...formData, profile_pic: null})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            return setError("Passwords do not match");
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if(formData[key] !== null && formData[key] !== ''){
                data.append(key, formData[key]);
            }
        });

        setLoading(true);
        const result = await register(data);
        if (!result.success) {
            setError(result.error);
        } else {
            navigate('/');  // Redirect on success
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full mx-auto'>
                <div className='text-center mb-8'>
                    <div className='flex justify-center mb-4'>
                        <div className='p-3 bg-stone-100 rounded-full'>
                            <ShoppingCart className="h-10 w-10 text-stone-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Create account</h2>
                    <p className="mt-2 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className='bg-white py-8 px-10 shadow-xl rounded-xl border border-gray-100'>
                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
                                <input name="first_name" type="text" required value={formData.first_name} onChange={handleChange} placeholder='John' autoComplete='username' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
                                <input name="last_name" type="text" required value={formData.last_name} onChange={handleChange} placeholder='Smith' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder='+91 98765 43210' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder='your@gmail.com' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                        </div>

                        {/* Gender and DOB Fields */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none'>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Date of Birth</label>
                                <input name="dob" type="date" value={formData.dob} onChange={handleChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Profile Picture</label>
                            <input name="profile_pic" type="file" accept="image/*" onChange={handleImage} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none' />
                            {previewUrl && (
                                <div className='mt-2 relative w-24 h-24'>
                                    <img src={previewUrl} alt="Preview" className='w-full h-full object-cover rounded-md' />
                                    <button type="button" onClick={removeImage} className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1'>
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* PASSWORD SECTION */}
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete='new-password'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none pr-10'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
                                <div className="relative">
                                    <input
                                        name="confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        autoComplete='new-password'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stone-500 outline-none pr-10'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full mt-6 bg-stone-600 text-white py-2.5 rounded-md font-bold hover:bg-stone-700 transition duration-200 disabled:opacity-50 shadow-md'
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;